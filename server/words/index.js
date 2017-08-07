import _ from 'lodash'
import { Words } from '/lib/collections.js'

export function getWords (userId) {
  const main = _.sample(Words.find({ userId, type: 'main' }).map(w => w.content))
  const prefix = _.sample(Words.find({ userId, type: 'prefix' }).map(w => w.content))

  if (!prefix) {
    return main
  } else {
    return `${prefix}，${main}`
  }
}
