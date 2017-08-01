import request from 'request-promise'
import faker from 'faker'
import _ from 'lodash'
import { delay } from '/lib/utils'
import crawlers from './crawlers.js'
import { Proxy, Status } from '/lib/collections.js'

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
  Status.update({ name: 'proxy' }, { $inc: { total: proxyList.length } })

  for (let i = 0; i < proxyList.length; i++) {
    const proxy = await ping(proxyList[i])

    if (proxy) {
      const doc = { addr: proxy, times: 0, success: 0, date: new Date() }

      Proxy.insert(doc, _.noop)
    }

    Status.update({ name: 'proxy' }, { $inc: { current: 1 } })
  }
}

async function crawlSite (crawler, total = 10) {
  for (let n = 1; n <= total; n++) {
    const proxyList = await crawler(n)

    await processProxyList(proxyList)
  }
}

export function crawl () {
  const status = Status.findOne({ name: 'proxy', busy: true })

  if (status) { return }

  Status.update({ name: 'proxy' }, { $set: { busy: true, total: 0, current: 0 } })

  return Promise.all([
    crawlSite(crawlers.xicidaili, 1),
    crawlSite(crawlers.sixsixip, 1),
  ])
  .then(() => Status.update({ name: 'proxy' }, { $set: { busy: false, total: 0, current: 0 } }))
}
