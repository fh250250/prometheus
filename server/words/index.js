import _ from 'lodash'
import { Words } from '/lib/collections.js'

import sym from './sym.js'
import emoji from './emoji.js'
import text from './text.js'

function render (str) {
  return str.replace(/\{sym\}/g, _.sample(sym))
            .replace(/\{emoji\}/g, _.sample(emoji))
            .replace(/\{text\}/g, _.sample(text))
}

export function getWords (userId) {
  const words = Words.findOne({ userId })

  const word = _.sample(words.content.split('\n').filter(line => line))

  return render(word)
}
