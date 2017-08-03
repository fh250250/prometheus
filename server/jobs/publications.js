import { Meteor } from 'meteor/meteor'
import { Jobs } from '/lib/collections.js'

Meteor.publish('jobs.proxy', function () {
  return Jobs.find({ name: 'proxy' })
})

Meteor.publish('jobs.register', function () {
  return Jobs.find({ name: 'accounts.register' })
})
