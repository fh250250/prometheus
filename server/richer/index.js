import faker from 'faker'
import _ from 'lodash'
import { Jobs, Accounts } from '/lib/collections.js'
import { fakeDistribution, delay } from '/lib/utils.js'
import { ensureRequestWithProxy } from '../proxy/index.js'

async function bindEx (account, code) {
  const [json, _proxy] = await ensureRequestWithProxy({
    uri: 'http://a1.go2yd.com/Website/invite/bind-ex',
    headers: {
      'user-agent': faker.internet.userAgent(),
      cookie: account.cookie
    },
    qs: {
      invite_code: code,
      appid: 'yidian',
      version: '020126',
      platform: 1,
      cv: '4.3.0.2',
      distribution: fakeDistribution()
    },
    json: true,
    timeout: 5000
  })

  if (json.code === undefined) { throw new Error('接口没收到数据') }
  if (json.code) { console.log(json.reason) }

  Accounts.update({ _id: account._id }, {
    $set: {
      new: false,
      checked: false
    }
  })
}

async function doCheckIn(account) {
  const [json, _proxy] = await ensureRequestWithProxy({
    uri: 'http://a1.go2yd.com/Website/invite/checkin',
    headers: {
      'user-agent': faker.internet.userAgent(),
      cookie: account.cookie
    },
    qs: {
      appid: 'yidian',
      version: '020126',
      platform: 1,
      cv: '4.3.0.2',
      distribution: fakeDistribution()
    },
    json: true,
    timeout: 5000
  })

  if (json.code === undefined) { throw new Error('接口没收到数据') }
  if (json.code) { console.log(json.reason) }

  Accounts.update({ _id: account._id }, { $set: { checked: true } })
}

async function wrapDoCheckIn(account) {
  await delay(_.random(1, 10) * 100)

  try {
    await doCheckIn(account)
  } catch (err) {
    console.error(err.message)
  }

  Jobs.update({ name: 'richer.checkin' }, { $inc: { count: 1 } })
}

async function miscInfo(account) {
  const [json, _proxy] = await ensureRequestWithProxy({
    uri: 'http://a1.go2yd.com/Website/invite/misc-info',
    headers: {
      'user-agent': faker.internet.userAgent(),
      cookie: account.cookie
    },
    qs: {
      appid: 'yidian',
      version: '020126',
      platform: 1,
      cv: '4.3.0.2',
      distribution: fakeDistribution()
    },
    json: true,
    timeout: 5000
  })

  if (json.code === undefined) { throw new Error('接口没收到数据') }
  if (json.code) { throw new Error(json.reason) }

  if (!json.hasmaster) {
    Accounts.update({ _id: account._id }, { $set: { new: true, checked: false } })
  }

  if (account.checked && !json.checkin_today) {
    Accounts.update({ _id: account._id }, { $set: { checked: false } })
  }
}

async function wrapMiscInfo(account) {
  await delay(_.random(1, 10) * 100)

  try {
    await miscInfo(account)
  } catch (err) {
    console.error(err.message)
  }

  Accounts.update({ _id: account._id }, { $set: { detected: true } })
  Jobs.update({ name: 'richer.detect' }, { $inc: { count: 1 } })
}

export async function bind(count, code) {
  const job = Jobs.findOne({ name: 'richer.bind' })

  if (job.running) { return }

  Jobs.update({ name: 'richer.bind' }, {
    $set: {
      running: true,
    }
  })

  const accounts = Accounts.find({ for: 'RICHER', new: true }, { limit: count }).fetch()

  for (let i = 0; i < accounts.length; i++) {
    try {
      await bindEx(accounts[i], code)
    } catch (err) {
      console.error(err.message)
    }
  }

  Jobs.update({ name: 'richer.bind' }, { $set: { running: false } })
}

export async function checkin() {
  const job = Jobs.findOne({ name: 'richer.checkin' })

  if (job.running) { return }

  Jobs.update({ name: 'richer.checkin' }, {
    $set: {
      running: true,
      count: 0,
      total: Accounts.find({ for: 'RICHER', new: false, checked: false }).count()
    }
  })

  while (true) {
    const accounts = Accounts.find({ for: 'RICHER', new: false, checked: false }, { limit: 10 }).fetch()

    if (!accounts.length) { break }

    try {
      await Promise.all(accounts.map(wrapDoCheckIn))
    } catch (err) {
      console.error(err.message)
    }
  }

  Jobs.update({ name: 'richer.checkin' }, { $set: { running: false } })
}

export async function detect() {
  const job = Jobs.findOne({ name: 'richer.detect' })

  if (job.running) { return }

  // 都标记为 未探测 状态
  Accounts.update({ for: 'RICHER', new: false }, { $set: { detected: false } }, { multi: true })

  Jobs.update({ name: 'richer.detect' }, {
    $set: {
      running: true,
      count: 0,
      total: Accounts.find({ for: 'RICHER', detected: false }).count()
    }
  })

  while (true) {
    const accounts = Accounts.find({ for: 'RICHER', detected: false }, { limit: 10 }).fetch()

    if (!accounts.length) { break }

    try {
      await Promise.all(accounts.map(wrapMiscInfo))
    } catch (err) {
      console.error(err.message)
    }
  }

  Jobs.update({ name: 'richer.detect' }, { $set: { running: false } })
}
