import { Meteor } from 'meteor/meteor'
import { run, detect } from './index.js'
import { Tasks, Words } from '/lib/collections.js'

Meteor.methods({
  'tasks.run'() {
    const mainWords = Words.findOne({ userId: this.userId, type: 'main' })

    if (!mainWords) {
      throw new Meteor.Error('no-words', '未设置话术')
    }

    Meteor.defer(() => run(this.userId))
  },
  'tasks.detect'() {
    Meteor.defer(() => detect(this.userId))
  },
  'tasks.complete'(_id, completed) {
    Tasks.update({ _id }, { $set: { completed } })
  },
})
