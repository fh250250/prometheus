import { Meteor } from 'meteor/meteor'
import { Jobs } from '/lib/collections.js'

Meteor.publish('jobs.proxy', function () {
  return Jobs.find({ name: 'proxy' })
})

Meteor.publish('jobs.register', function () {
  return Jobs.find({ name: 'accounts.register' })
})

Meteor.publish('jobs.richer.bind', function () {
  return Jobs.find({ name: 'richer.bind' })
})

Meteor.publish('jobs.richer.checkin', function () {
  return Jobs.find({ name: 'richer.checkin' })
})

Meteor.publish('jobs.tasks', function () {
  return Jobs.find({ userId: this.userId })
})
