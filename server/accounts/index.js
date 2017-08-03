import { Meteor } from 'meteor/meteor'
import request from 'request-promise'
import faker from 'faker'
import { Accounts } from '/lib/collections.js'
import { requestWithProxy } from '../proxy/index.js'
import { delay } from '/lib/utils.js'

function requestSMS (action, args) {
  return request({
    uri: 'http://api.hellotrue.com/api/do.php',
    timeout: 10000,
    qs: { ...args, action },
    transform: body => body.trim().split('|').map(f => f.trim())
  })
}

async function getSMSToken (ctx) {
  const data = await requestSMS('loginIn', { name: Meteor.settings.sms.key, password: Meteor.settings.sms.password })

  if (data[0] === '0') { throw new Error(data[1]) }

  ctx.token = data[1]
}

async function getPhoneNumber (ctx) {
  const data = await requestSMS('getPhone', { sid: Meteor.settings.sms.sid, token: ctx.token })

  if (data[0] === '0') { throw new Error(data[1]) }

  ctx.phoneNumber = data[1]
}

async function pollCode (ctx) {
  let tryTimes = 0

  while (true) {
    const data = await requestSMS('getMessage', { sid: Meteor.settings.sms.sid, phone: ctx.phoneNumber, token: ctx.token })

    tryTimes++

    if (data[0] === '1') { return ctx.code = data[1].match(/\d{4,}/)[0] }

    if (!/还没有接收到短信/.test(data[1])) { throw new Error(data[1]) }

    if (tryTimes > 20) { throw new Error('1 分钟内未收到短信') }

    await delay(3000)
  }
}

async function sendCode (ctx) {
  while (true) {
    try {
      const [json, proxy] = await requestWithProxy({
        uri: 'http://www.yidianzixun.com/home/q/mobile_verify',
        headers: { 'user-agent': faker.internet.userAgent() },
        qs: {
          mobile: `86${ctx.phoneNumber}`,
          appid: 'yidian',
          deviceid: ctx.deviceid
        },
        timeout: 5000,
        json: true
      })

      if (json.code) {
        const err = new Error(json.reason)
        err.reason = 'ERR_API'

        throw err
      }

      return ctx.proxy = proxy
    } catch (err) {
      if (err.reason === 'ERR_API') { throw err }
    }
  }
}

async function doRegister (ctx) {
  const password = faker.random.alphaNumeric(8)

  const [res, _proxy] = await requestWithProxy({
    uri: 'http://www.yidianzixun.com/home/q/mobile_sign_in',
    headers: { 'user-agent': faker.internet.userAgent() },
    qs: {
      mobile: `86${ctx.phoneNumber}`,
      password,
      code: ctx.code,
      appid: 'yidian',
      deviceid: ctx.deviceid,
      _: Date.now()
    },
    json: true,
    resolveWithFullResponse: true
  }, ctx.proxy)

  const json = res.body

  if (json.code) { throw new Error(json.reason) }

  Accounts.insert({
    userid: json.userid,
    username: json.username,
    nickname: json.nickname,
    cookie: json.cookie,
    webCookie: res.headers['set-cookie'].join(';'),
    password,
    times: 0,
    for: 'COMMENT',
    date: new Date(),
  })
}

async function registerOne () {
  const ctx = {
    token: null,
    phoneNumber: null,
    code: null,
    proxy: null,
    deviceid: faker.random.alphaNumeric(15),
  }

  await getSMSToken(ctx)
  await getPhoneNumber(ctx)
  await sendCode(ctx)
  await pollCode(ctx)
  await doRegister(ctx)
}

export async function register(count) {
}
