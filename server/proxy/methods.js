import { Meteor } from 'meteor/meteor'
import { crawl } from './index.js'

Meteor.methods({
  'proxy.crawl'() {
    Meteor.defer(crawl)
  }
})
