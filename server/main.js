import { Accounts as MeteorAccounts } from 'meteor/accounts-base'
import { Jobs, Channels } from '/lib/collections.js'

MeteorAccounts.onCreateUser((_opts, user) => {
  Jobs.insert({ userId: user._id, name: 'tasks', running: false })
  Jobs.insert({ userId: user._id, name: 'tasks.detect', running: false })

  const initChannels = [
    { id: 'u11272', name: '搞笑GIF' },
    { id: 't1121', name: '街拍' },
    { id: 's10671', name: '搞笑' },
    { id: 'u11392', name: '趣图' },
    { id: 'u241', name: '美女' },
    { id: 's11933', name: '内涵段子' },
  ]

  initChannels.forEach(channel => Channels.insert({ ...channel, userId: user._id }))

  return user
})
