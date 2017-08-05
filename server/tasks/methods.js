import { Meteor } from 'meteor/meteor'
import { run, startLikeProcess } from './index.js'

Meteor.methods({
  'tasks.run'() {
    Meteor.defer(() => run(this.userId))
  },
  'tasks.like'() {
    Meteor.defer(() => startLikeProcess(this.userId))
  }
})
