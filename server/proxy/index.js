import request from 'request-promise'
import faker from 'faker'
import _ from 'lodash'
import { delay } from '/lib/utils'
import crawlers from './crawlers.js'
import { Proxy, Jobs } from '/lib/collections.js'

async function ping (proxy) {
  let ret = null

  try {
    await request({
      uri: 'http://www.baidu.com',
      proxy,
      timeout: 5000,
      headers: { 'user-agent': faker.internet.userAgent() }
    })

    ret = proxy
  } catch (err) {}

  Jobs.update({ name: 'proxy' }, { $inc: { 'progress.current': 1 } })

  return ret
}

async function processProxyList (proxyList) {
  Jobs.update({ name: 'proxy' }, { $inc: { 'progress.total': proxyList.length } })

  const chunks = _.chunk(proxyList, 10)

  for (let i = 0; i < chunks.length; i++) {
    const list = await Promise.all(chunks[i].map(ping))

    for (let j = 0; j < list.length; j++) {
      const proxy = list[j]

      if (proxy) {
        const doc = { addr: proxy, times: 0, success: 0, date: new Date() }

        Proxy.insert(doc, _.noop)
      }
    }
  }
}

async function crawlSite (crawler, total = 10) {
  for (let n = 1; n <= total; n++) {
    const proxyList = await crawler(n)

    await processProxyList(proxyList)
  }
}

export async function crawl () {
  const job = Jobs.findOne({ name: 'proxy' })

  if (job.running) { return }

  Jobs.update({ name: 'proxy' }, {
    $set: {
      running: true,
      progress: { current: 0, total: 0 }
    }
  })

  try {
    await Promise.all([
      crawlSite(crawlers.xicidaili, 20),
      crawlSite(crawlers.sixsixip, 20),
      crawlSite(crawlers.nianshao, 50),
      crawlSite(crawlers.httpsdaili, 10),
    ])
  } catch (err) {
    console.error(err)
  }

  Jobs.update({ name: 'proxy' }, { $set: { running: false } })
}

export async function requestWithProxy (requestOpts, thisProxy) {
  const proxyCount = Proxy.find({}).count()

  if (proxyCount < 200) { Meteor.defer(crawl) }

  const proxy = thisProxy || Proxy.findOne({}, { sort: { date: 1 } })

  if (!proxy) { throw new Error('no proxy') }

  // 增加此代理使用次数，更新时间
  Proxy.update({ _id: proxy._id }, { $inc: { times: 1 }, $currentDate: { date: true } })

  try {
    const requestValue = await request({ ...requestOpts, proxy: proxy.addr })

    // 增加成功次数
    Proxy.update({ _id: proxy._id }, { $inc: { success: 1 } })

    return [requestValue, Proxy.findOne({ _id: proxy._id })]
  } catch (err) {
    if (proxy.times > 10 && (proxy.success / proxy.times) < 0.7) {
      // 成功率小于 70%
      Proxy.remove({ _id: proxy._id })
    }

    throw err
  }
}
