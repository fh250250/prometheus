import { Meteor } from 'meteor/meteor'
import { run, detect } from './index.js'
import { Tasks, Words } from '/lib/collections.js'

Meteor.methods({
  'tasks.run'(count) {
    const words = Words.findOne({ userId: this.userId })

    if (!words || !words.content) {
      throw new Meteor.Error('no-words', '未设置话术')
    }

    Meteor.defer(() => run(this.userId, count))
  },
  'tasks.detect'() {
    Meteor.defer(() => detect(this.userId))
  },
  'tasks.complete'(_id, completed) {
    Tasks.update({ _id }, { $set: { completed } })
  },
})
