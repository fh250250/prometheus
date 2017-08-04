import faker from 'faker'
import moment from 'moment'
import _ from 'lodash'
import { requestWithProxy } from '../proxy/index.js'
import { useAccountFor } from '../accounts/index.js'
import { getWords } from '../words/index.js'
import { Tasks, Accounts } from '/lib/collections.js'

async function ensureRequestWithProxy (requestOpts) {
  let tryTimes = 0

  while (true) {
    try {
      return await requestWithProxy(requestOpts)
    } catch (err) {
      if (tryTimes++ > 100) { throw err }
    }
  }
}

function fakeDistribution () {
  return _.sample([
    'www.meizu.com',
    'www.mi.com',
    'www.vivo.com',
    'www.huawei.com',
    'www.samsung.com'
  ])
}

async function fetchNewsByChannel (channelId) {
  const [json, _proxy] = await ensureRequestWithProxy({
    uri: 'http://www.yidianzixun.com/home/q/news_list_for_channel',
    headers: { 'user-agent': faker.internet.userAgent() },
    qs: {
      channel_id: channelId,
      cstart: 0,
      cend: 30,
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

    if (!Tasks.findOne({ docid: article.docid })) {
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
    completed: false
  })
}

export async function run (userId) {
  try {
    console.log('--> fetchNewsByChannel')
    const articles = await fetchNewsByChannel('u11272')
    console.log('<-- fetchNewsByChannel', articles[0])

    await commentArticle(userId, articles[0])
    console.log('done')
  } catch (err) {
    console.log(err)
  }
}
