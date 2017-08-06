import { Meteor } from 'meteor/meteor'
import { Channels } from '/lib/collections.js'

Meteor.methods({
  'channels.insert'(id, name) {
    Channels.insert({ userId: this.userId, id, name })
  },
  'channels.remove'(_id) {
    Channels.remove({ _id })
  }
})
