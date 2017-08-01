import request from 'request-promise'
import cheerio from 'cheerio'
import faker from 'faker'

export function xicidaili (page = 1) {
  return request({
    uri: `http://www.xicidaili.com/wt/${page}`,
    headers: { 'user-agent': faker.internet.userAgent() },
    transform: body => cheerio.load(body)
  })
  .then($ => {
    return $('#ip_list tr')
            .filter(idx => idx !== 0)
            .map((idx, ele) => {
              const $tds = $(ele).find('td')

              const host = $tds.eq(1).text()
              const port = $tds.eq(2).text()

              return `http://${host}:${port}`
            })
            .get()
  })
  .catch(err => [])
}

export function sixsixip (page = 1) {
  return request({
    uri: 'http://www.66ip.cn/mo.php?tqsl=50',
    headers: { 'user-agent': faker.internet.userAgent() }
  })
  .then(html => {

    const lines = html.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{2,5}/g)

    if (!lines) { return [] }

    return lines.map(line => {
      const d = line.split(':')

      return `http://${d[0]}:${d[1]}`
    })
  })
  .catch(err => [])
}
