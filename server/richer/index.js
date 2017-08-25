import faker from 'faker'
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

  Accounts.update({ _id: account._id }, { $set: { checked: true } })
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

    await delay(1000)
  }

  Jobs.update({ name: 'richer.bind' }, { $set: { running: false } })
}

export async function checkin() {
  const job = Jobs.findOne({ name: 'richer.checkin' })

  if (job.running) { return }

  Jobs.update({ name: 'richer.checkin' }, {
    $set: {
      running: true,
    }
  })

  const accounts = Accounts.find({ for: 'RICHER', new: false, checked: false }).fetch()

  for (let i = 0; i < accounts.length; i++) {
    try {
      await doCheckIn(accounts[i])
    } catch (err) {
      console.error(err.message)
    }

    await delay(1000)
  }

  Jobs.update({ name: 'richer.checkin' }, { $set: { running: false } })
}
