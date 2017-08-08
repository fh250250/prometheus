import { Meteor } from 'meteor/meteor'
import moment from 'moment'
import { Tasks } from '/lib/collections.js'

Meteor.publish('tasks', function () {
  return Tasks.find({ userId: this.userId, date: { $gt: moment().subtract(5, 'days').toDate() } })
})
