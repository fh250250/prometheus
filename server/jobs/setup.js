import { Meteor } from 'meteor/meteor'
import { Jobs } from '/lib/collections.js'

Jobs.upsert({ name: 'proxy' }, {
  $set: {
    running: false,
    progress: { current: 0, total: 0 },
  }
})

Jobs.upsert({ name: 'accounts.register' }, {
  $set: {
    running: false,
    total: 0,
    success: 0,
    failure: 0,
  }
})

Meteor.users.find({}).forEach(user => {
  Jobs.upsert({ userId: user._id, name: 'tasks' }, {
    $set: {
      running: false,
    }
  })

  Jobs.upsert({ userId: user._id, name: 'tasks.detect' }, {
    $set: {
      running: false,
    }
  })
})
