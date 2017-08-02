import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

Meteor.users.deny({
  insert () { return true },
  update () { return true },
  remove () { return true },
})

export const Proxy = new Mongo.Collection('proxy')
if (Meteor.isServer) {
  Proxy.rawCollection().createIndex({ addr: 1 }, { unique: true })
  Proxy.rawCollection().createIndex({ times: 1 })
}

export const Words = new Mongo.Collection('words')

export const Jobs = new Mongo.Collection('jobs')
