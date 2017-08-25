import { Meteor } from 'meteor/meteor'
import { bind, checkin, detect } from './index.js'
import { Accounts } from '/lib/collections.js'

Meteor.methods({
  'richer.bind'(count, code) {
    const newAccountsCount = Accounts.find({ for: 'RICHER', new: true }).count()

    if (newAccountsCount < count) {
      throw new Meteor.Error('bad-count', '没有足够账号')
    }

    Meteor.defer(() => bind(count, code))
  },
  'richer.checkin'() {
    Meteor.defer(checkin)
  },
  'richer.detect'() {
    Meteor.defer(detect)
  }
})
