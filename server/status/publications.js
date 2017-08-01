import { Meteor } from 'meteor/meteor'
import { Status } from '/lib/collections.js'

Meteor.publish('status', function () {
  return Status.find({})
})
