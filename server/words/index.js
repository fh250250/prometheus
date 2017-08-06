import _ from 'lodash'
import { Words } from '/lib/collections.js'

export function getWords (userId) {
  const main = Words.find({ userId, type: 'main' }).map(w => w.content)
  const prefix = Words.find({ userId, type: 'prefix' }).map(w => w.content)

  if (!prefix) {
    return _.sample(main)
  } else {
    return `${_.sample(prefix)}，${_.sample(main)}`
  }
}
