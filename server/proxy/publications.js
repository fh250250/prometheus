import { Meteor } from 'meteor/meteor'
import { Proxy } from '/lib/collections.js'

Meteor.publish('proxy.list', function () {
  return Proxy.find({})
})
