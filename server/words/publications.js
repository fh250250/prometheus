import { Meteor } from 'meteor/meteor'
import { Words } from '/lib/collections.js'

Meteor.publish('words', function () {
  return Words.find({ userId: this.userId })
})
