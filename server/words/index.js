import _ from 'lodash'
import { Words } from '/lib/collections.js'

export function getWords (userId) {
  const words = Words.findOne({ userId })

  const arr = words.content
                    .split('\n')
                    .filter(line => line)

  return _.sample(arr)
}
