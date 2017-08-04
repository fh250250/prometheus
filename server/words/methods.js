import { Meteor } from 'meteor/meteor'
import { Words } from '/lib/collections.js'

Meteor.methods({
  'words.insert'(type, content) {
    Words.insert({
      userId: this.userId,
      type,
      content,
      date: new Date()
    })
  },
  'words.update'(_id, content) {
    Words.update({ _id }, { $set: { content } })
  },
  'word.remove'(_id) {
    Words.remove({ _id })
  }
})
