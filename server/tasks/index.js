import faker from 'faker'
import moment from 'moment'
import _ from 'lodash'
import unescapeJS from '/lib/unescape.js'
import { ensureRequestWithProxy } from '../proxy/index.js'
import { useAccountFor } from '../accounts/index.js'
import { getWords } from '../words/index.js'
import { Tasks, Jobs, Channels } from '/lib/collections.js'
import { delay, fakeDistribution } from '/lib/utils.js'

async function fetchChannelPage (channelId) {
  try {
    const [res, _proxy] = await ensureRequestWithProxy({
      uri: `http://www.yidianzixun.com/channel/${channelId}`,
      headers: { 'user-agent': faker.internet.userAgent() },
      resolveWithFullResponse: true,
      timeout: 5000
    })

    const cookie = res.headers['set-cookie'].join(';')
    const str = res.body.match(/window.yidian.docinfo = (.*)/)[1]
    const docinfo = JSON.parse(unescapeJS(str))

    return [cookie, _.get(docinfo, 'current_channel.channel_id', channelId)]
  } catch (err) {
    return ['', channelId]
  }
}

async function fetchNewsByChannel (userId, channelId, count) {
  const [cookie, newChannelId] = await fetchChannelPage(channelId)

  const [json, _proxy] = await ensureRequestWithProxy({
    uri: 'http://www.yidianzixun.com/home/q/news_list_for_channel',
    headers: { 'user-agent': faker.internet.userAgent(), cookie },
    qs: {
      channel_id: newChannelId,
      cstart: 0,
      cend: count || 10,
      infinite: true,
      refresh: 1,
      __from__: 'pc',
      multi: 5,
      appid: 'web_yidian',
      _: Date.now()
    },
    timeout: 5000,
    json: true
  })

  if (json.code) { throw new Error(json.reason) }

  const articles = []
  for (let i = 0; i < json.result.length; i++) {
    const article = json.result[i]

    if (!Tasks.findOne({ userId, docid: article.docid })) {
      articles.push(article)
    }
  }

  return articles.filter(a => a.docid && a.comment_count >= 10)
                 .filter(a => {
                   const now = moment()
                   const date = moment(a.date)

                   return now.diff(date, 'days') <= 2
                 })
}

async function wrapFetchNewsByChannel (userId, channelId, count) {
  try {
    return await fetchNewsByChannel(userId, channelId, count)
  } catch (err) {
    console.error(err)
    return []
  }
}

async function fetchAllNews (userId, count) {
  const channels = Channels.find({ userId }).fetch()

  const articles = _.flatten(await Promise.all(channels.map(c => wrapFetchNewsByChannel(userId, c.id, count))))

  return _.uniqBy(articles, 'docid')
}

async function calcLikeCount (docid) {
  try {
    const [json, _proxy] = await ensureRequestWithProxy({
      uri: 'http://www.yidianzixun.com/home/q/getcomments',
      headers: { 'user-agent': faker.internet.userAgent() },
      qs: {
        docid,
        s: '',
        count: 30,
        last_comment_id: '',
        appid: 'web_yidian',
        _: Date.now()
      },
      json: true,
      timeout: 5000
    })

    if (json.code) { return 35 }

    const hots = json.hot_comments

    if (!hots || hots.length < 3) { return 35 }

    const sortHots = hots.sort((a, b) => b.like - a.like)

    if (sortHots[0].like < 100) { return sortHots[0].like + 10 }

    return sortHots[2].like > 200 ?  200 : sortHots[2].like + 20
  } catch (err) {
    return 35
  }
}

async function commentArticle (userId, article) {
  const account = useAccountFor('COMMENT')
  const words = getWords(userId)

  const [json, _proxy] = await ensureRequestWithProxy({
    uri: 'http://a1.go2yd.com/Website/interact/add-comment',
    headers: {
      'user-agent': faker.internet.userAgent(),
      'x-tingyun-processed': true,
      cookie: account.cookie
    },
    qs: {
      platform: 1,
      meta: article.meta,
      cv: '4.0.1.0',
      title_sn: article.title_sn,
      distribution: fakeDistribution(),
      appid: 'yidian',
      comment: words,
      impid: article.impid,
      itemid: article.itemid,
      docid: article.docid,
      version: '020123',
      net: 'wifi'
    },
    json: true,
    timeout: 5000
  })

  if (json.code) { throw new Error(json.reason) }
  if (json.comment.pending_reason) { throw new Error(json.comment.pending_reason) }

  const targetLikeCount = await calcLikeCount(article.docid)

  Tasks.insert({
    userId,
    docid: article.docid,
    title: article.title,
    comment_id: json.comment.comment_id,
    words,
    target: targetLikeCount,
    like: 0,
    completed: false,
    errorTimes: 0,
    date: new Date()
  })
}

async function commentAllArticles (userId, articles) {
  for (let i = 0; i < articles.length; i++) {
    try {
      await commentArticle(userId, articles[i])
    } catch (err) {
      console.error(err)
    }
  }
}

function getLikeOpts (commentId, account) {
  return {
    uri: 'http://a1.go2yd.com/Website/interact/like-comment',
    headers: {
      'user-agent': faker.internet.userAgent,
      'x-tingyun-processed': true,
      cookie: account.cookie
    },
    qs: {
      platform: 1,
      appid: 'yidian',
      cv: '4.0.1.0',
      distribution: fakeDistribution(),
      comment_id: commentId,
      version: '020123',
      net: 'wifi'
    },
    json: true,
    timeout: 3000
  }
}

async function likeOnce (tasks) {
  const account = useAccountFor('LIKE')
  let proxy = null

  for (let i = 0; i < tasks.length; i++) {
    const task = Tasks.findOne({ _id: tasks[i]._id })

    if (!task) { continue }
    if (task.completed) { continue }

    if (task.like >= task.target || task.errorTimes >= 5) {
      Tasks.update({ _id: task._id }, { $set: { completed: true, errorTimes: 0 } })
      continue
    }

    try {
      const [json, newProxy] = await ensureRequestWithProxy(getLikeOpts(task.comment_id, account), proxy)

      proxy = newProxy

      if (json.code) { throw new Error(json.reason) }

      Tasks.update({ _id: task._id }, { $inc: { like: 1 }, $set: { errorTimes: 0 } })
    } catch (err) {
      if (/找不到评论/.test(err.message)) {
        Tasks.remove({ _id: task._id })
      } else {
        Tasks.update({ _id: task._id }, { $inc: { errorTimes: 1 } })
        return
      }
    }

    await delay(_.random(2, 4) * 100)
  }
}

async function startLikeProcess (userId) {
  try {
    while (true) {
      const tasks = Tasks.find({ userId, completed: false }).fetch()

      if (!tasks.length) { return }

      await likeOnce(tasks)
    }
  } catch (err) {
    console.error(err)
  }
}

async function doDetect (taskId) {
  const task = Tasks.findOne({ _id: taskId })
  const account = useAccountFor('LIKE')

  try {
    const [json, _proxy] = await ensureRequestWithProxy(getLikeOpts(task.comment_id, account))

    if (json.code) { throw new Error(json.reason) }

    Tasks.update({ _id: task._id }, { $inc: { like: 1 } })
  } catch (err) {
    if (/找不到评论/.test(err.message)) {
      Tasks.remove({ _id: task._id })
    }
  }
}

export async function run (userId, count) {
  const job = Jobs.findOne({ userId, name: 'tasks' })

  if (job.running) { return }

  Jobs.update({ userId, name: 'tasks' }, {
    $set: { running: true }
  })

  const articles = await fetchAllNews(userId, count)

  await commentAllArticles(userId, articles)

  await startLikeProcess(userId)

  Jobs.update({ userId, name: 'tasks' }, {
    $set: { running: false }
  })
}

export async function detect (userId) {
  const job = Jobs.findOne({ userId, name: 'tasks.detect' })

  if (job.running) { return }

  Jobs.update({ userId, name: 'tasks.detect' }, {
    $set: { running: true }
  })

  const tasks = Tasks.find({ userId, completed: true, date: { $gt: moment().subtract(2, 'days').toDate() } }).fetch()

  for (let i = 0; i < tasks.length; i++) {
    await doDetect(tasks[i]._id)
  }

  Jobs.update({ userId, name: 'tasks.detect' }, {
    $set: { running: false }
  })
}
