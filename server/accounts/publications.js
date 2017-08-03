import { Meteor } from 'meteor/meteor'
import { Accounts } from '/lib/collections.js'

Meteor.publish('accounts', function () {
  return Accounts.find({})
})
