import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { Table, Button, message } from 'antd'

import { Accounts, Jobs } from '/lib/collections.js'

const AccountsTable = createContainer(() => {
  const accountsHandle = Meteor.subscribe('accounts')

  return {
    ready: accountsHandle.ready(),
    accounts: Accounts.find({ for: 'RICHER', new: false }).fetch(),
    checkedCount: Accounts.find({ for: 'RICHER', new: false, checked: true }).count()
  }
}, class extends Component {
  render () {
    const { accounts, ready, checkedCount } = this.props

    return (
      <Table
        rowKey="_id"
        dataSource={accounts}
        loading={!ready}
        bordered
        title={() => `个数: ${accounts.length} 已签到：${checkedCount}`}
        style={{ backgroundColor: 'white', margin: '10px 0' }}
      >
        <Table.Column title="账号" dataIndex="username" />
        <Table.Column title="密码" dataIndex="password" />
        <Table.Column title="昵称" dataIndex="nickname" />
        <Table.Column title="已签到" dataIndex="checked" render={checked => checked ? '是' : '否'} />
      </Table>
    )
  }
})

export default createContainer(() => {
  const jobHandle = Meteor.subscribe('jobs.richer.checkin')

  return {
    ready: jobHandle.ready(),
    job: Jobs.findOne({ name: 'richer.checkin' })
  }
}, class Stage2 extends Component {
  constructor (props) {
    super(props)

    this.handleStart = this.handleStart.bind(this)
  }

  handleStart () {
    Meteor.call('richer.checkin', err => {
      if (err) {
        message.error('失败')
      }
    })
  }

  render () {
    const { ready, job } = this.props
    const disabled = !ready || job.running

    return (
      <div>
        <Button type="primary" onClick={this.handleStart} loading={disabled}>开始</Button>
        <AccountsTable />
      </div>
    )
  }
})
