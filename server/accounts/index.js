import { Meteor } from 'meteor/meteor'
import request from 'request-promise'
import faker from 'faker'
import { Accounts, Jobs } from '/lib/collections.js'
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
    timeout: 10000,
    json: true,
    resolveWithFullResponse: true
  }, ctx.proxy)

  const json = res.body

  if (json.code) { throw new Error(json.reason) }
  if (!json.userid) { throw new Error('接口未收到数据') }

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

  console.log('\n------------------------------------------')

  console.log('--> token')
  await getSMSToken(ctx)
  console.log(`<-- token: ${ctx.token}`)

  console.log('--> phone')
  await getPhoneNumber(ctx)
  console.log(`<-- phone: ${ctx.phoneNumber}`)

  console.log('--> send code')
  await sendCode(ctx)
  console.log('<-- send code')

  console.log('--> code')
  await pollCode(ctx)
  console.log(`<-- code: ${ctx.code}`)

  console.log('--> register')
  await doRegister(ctx)
  console.log('<-- register')
}

export async function register(count = 10) {
  const job = Jobs.findOne({ name: 'accounts.register' })

  if (job.running) { return }

  Jobs.update({ name: 'accounts.register' }, {
    $set: {
      running: true,
      total: count,
      success: 0,
      failure: 0
    }
  })

  for (let i = 0; i < count; i++) {
    try {
      await registerOne()

      Jobs.update({ name: 'accounts.register' }, { $inc: { success: 1 } })
    } catch (err) {
      Jobs.update({ name: 'accounts.register' }, { $inc: { failure: 1 } })
      console.log(err)
    }
  }

  Jobs.update({ name: 'accounts.register' }, { $set: { running: false } })
}
