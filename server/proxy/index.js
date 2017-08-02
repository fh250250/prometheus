import request from 'request-promise'
import faker from 'faker'
import _ from 'lodash'
import { delay } from '/lib/utils'
import crawlers from './crawlers.js'
import { Proxy, Jobs } from '/lib/collections.js'

function ping (proxy) {
  return request({
    uri: 'http://www.baidu.com',
    proxy,
    timeout: 3000,
    headers: { 'user-agent': faker.internet.userAgent() }
  })
  .then(() => proxy)
  .catch(err => null)
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

export function crawl () {
  const job = Jobs.findOne({ name: 'proxy' })

  if (job.running) { return }

  Jobs.update({ name: 'proxy' }, {
    $set: {
      running: true,
      progress: { current: 0, total: 0 }
    }
  })

  return Promise.all([
    crawlSite(crawlers.xicidaili, 10),
    crawlSite(crawlers.sixsixip, 10),
    crawlSite(crawlers.nianshao, 10),
    crawlSite(crawlers.httpsdaili, 10),
  ])
  .then(() => Jobs.update({ name: 'proxy' }, { $set: { running: false } }))
}
