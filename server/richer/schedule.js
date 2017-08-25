import schedule from 'node-schedule'
import { Accounts } from '/lib/collections.js'

schedule.scheduleJob('0 0 * * *', () => {
  Accounts.update({ for: 'RICHER', new: false }, { $set: { checked: false } }, { multi: true })
})
