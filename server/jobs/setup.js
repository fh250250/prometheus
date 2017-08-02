import { Meteor } from 'meteor/meteor'
import { Jobs } from '/lib/collections.js'

Jobs.upsert({ name: 'proxy' }, {
  $set: {
    running: false,
    progress: { current: 0, total: 0 },
  }
})
