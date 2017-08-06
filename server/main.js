import { Accounts as MeteorAccounts } from 'meteor/accounts-base'
import { Jobs } from '/lib/collections.js'

MeteorAccounts.onCreateUser((_opts, user) => {
  Jobs.insert({
    userId: user._id,
    name: 'tasks',
    running: false,
  })

  Jobs.insert({
    userId: user._id,
    name: 'tasks.detect',
    running: false,
  })

  return user
})
