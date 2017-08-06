import { Meteor } from 'meteor/meteor'
import { Channels } from '/lib/collections.js'

Meteor.publish('channels', function () {
  return Channels.find({ userId: this.userId })
})
