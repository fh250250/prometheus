import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

function initStatus (name, doc) {
  const r = Status.findOne({ name })

  if (r) {
    Status.update({ name }, { $set: doc })
  } else {
    Status.insert({ ...doc, name })
  }
}

export const Proxy = new Mongo.Collection('proxy')
if (Meteor.isServer) {
  Proxy.rawCollection().createIndex({ addr: 1 }, { unique: true })
  Proxy.rawCollection().createIndex({ times: 1 })
}

export const Status = new Mongo.Collection('status')
if (Meteor.isServer) {
  Status.rawCollection().createIndex({ name: 1 }, { unique: true })
  initStatus('proxy', { busy: false, total: 0, current: 0 })
}
