import { Meteor } from 'meteor/meteor'
import { Words } from '/lib/collections.js'

Meteor.methods({
  'words.upsert'(content) {
    Words.upsert({ userId: this.userId }, { $set: { content } })
  },
})
