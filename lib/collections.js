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
  Proxy.rawCollection().createIndex({ date: 1 })
}

export const Words = new Mongo.Collection('words')

export const Jobs = new Mongo.Collection('jobs')

export const Accounts = new Mongo.Collection('accounts')
if (Meteor.isServer) {
  Accounts.rawCollection().createIndex({ times: 1 })
}

export const Tasks = new Mongo.Collection('tasks')

export const Channels = new Mongo.Collection('channels')
