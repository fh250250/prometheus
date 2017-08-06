import { Meteor } from 'meteor/meteor'
import { run, detect } from './index.js'
import { Tasks } from '/lib/collections.js'

Meteor.methods({
  'tasks.run'() {
    Meteor.defer(() => run(this.userId))
  },
  'tasks.detect'() {
    Meteor.defer(() => detect(this.userId))
  },
  'tasks.complete'(_id, completed) {
    Tasks.update({ _id }, { $set: { completed } })
  },
})
