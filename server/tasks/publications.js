import { Meteor } from 'meteor/meteor'
import { Tasks } from '/lib/collections.js'

Meteor.publish('tasks', function () {
  return Tasks.find({ userId: this.userId })
})
