import { Meteor } from 'meteor/meteor'
import { register } from './index.js'
import { Accounts } from '/lib/collections.js'

Meteor.methods({
  'accounts.register'(count, forType, extra) {
    Meteor.defer(() => register(count, forType, extra))
  },
  'accounts.changeFor'(_id, type) {
    Accounts.update({ _id }, { $set: { for: type } })
  }
})
