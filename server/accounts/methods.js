import { Meteor } from 'meteor/meteor'
import { register } from './index.js'

Meteor.methods({
  'accounts.register'(count) {
    Meteor.defer(() => register(count))
  }
})
