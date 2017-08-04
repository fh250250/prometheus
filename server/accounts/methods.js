import { Meteor } from 'meteor/meteor'
import { register } from './index.js'
import { Accounts } from '/lib/collections.js'

Meteor.methods({
  'accounts.register'(count) {
    Meteor.defer(() => register(count))
  },
  'accounts.update'(_id, type) {
    Accounts.update({ _id }, { $set: { for: type } })
  }
})
