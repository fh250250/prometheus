import request from 'request-promise'
import faker from 'faker'
import _ from 'lodash'
import { delay } from '/lib/utils'
import crawlers from './crawlers.js'
import { Proxy, Jobs } from '/lib/collections.js'

async function ping (proxy) {
  try {
    await request({
      uri: 'http://www.baidu.com',
      proxy,
      timeout: 5000,
      headers: { 'user-agent': faker.internet.userAgent() }
    })

    return proxy
  } catch (err) {
    return null
  }
}

async function processProxyList (proxyList) {
  Jobs.update({ name: 'proxy' }, { $inc: { 'progress.total': proxyList.length } })

  for (let i = 0; i < proxyList.length; i++) {
    const proxy = await ping(proxyList[i])

    if (proxy) {
      const doc = { addr: proxy, times: 0, success: 0, date: new Date() }

      Proxy.insert(doc, _.noop)
    }

    Jobs.update({ name: 'proxy' }, { $inc: { 'progress.current': 1 } })
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

  await Promise.all([
    crawlSite(crawlers.xicidaili, 10),
    crawlSite(crawlers.sixsixip, 10),
    crawlSite(crawlers.nianshao, 10),
    crawlSite(crawlers.httpsdaili, 10),
  ])

  Jobs.update({ name: 'proxy' }, { $set: { running: false } })
}

export async function requestWithProxy (requestOpts, thisProxy) {
  const proxy = thisProxy || Proxy.findOne({}, { sort: { times: 1 } })

  if (!proxy) {
    Meteor.defer(crawl)
    throw new Error('no proxy')
  }

  // 增加此代理使用次数
  Proxy.update({ _id: proxy._id }, { $inc: { times: 1 } })
  proxy.times++

  try {
    const requestValue = await request({ ...requestOpts, proxy: proxy.addr })

    // 增加成功次数
    Proxy.update({ _id: proxy._id }, { $inc: { success: 1 } })
    proxy.success++

    return [requestValue, proxy]
  } catch (err) {
    if (proxy.times > 10 && (proxy.success / proxy.times) < 0.7) {
      // 成功率小于 70%
      Proxy.remove({ _id: proxy._id })
    }

    throw err
  }
}
