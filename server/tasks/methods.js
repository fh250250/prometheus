import { Meteor } from 'meteor/meteor'
import { run } from './index.js'

Meteor.methods({
  'tasks.run'() {
    Meteor.defer(() => run(this.userId))
  }
})
