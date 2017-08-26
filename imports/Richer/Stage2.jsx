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
  const checkInJobHandle = Meteor.subscribe('jobs.richer.checkin')
  const detectJobHandle = Meteor.subscribe('jobs.richer.detect')

  return {
    ready: checkInJobHandle.ready() && detectJobHandle.ready(),
    checkInJob: Jobs.findOne({ name: 'richer.checkin' }),
    detectJob: Jobs.findOne({ name: 'richer.detect' }),
  }
}, class Stage2 extends Component {
  constructor (props) {
    super(props)

    this.handleStart = this.handleStart.bind(this)
    this.handleDetect = this.handleDetect.bind(this)
  }

  handleStart () {
    Meteor.call('richer.checkin', err => {
      if (err) {
        message.error('失败')
      }
    })
  }

  handleDetect () {
    Meteor.call('richer.detect', err => {
      if (err) {
        message.error('失败')
      }
    })
  }

  render () {
    const { ready, checkInJob, detectJob } = this.props
    const detectLoading = !ready || detectJob.running
    const checkInLoading = !ready || checkInJob.running

    const detectStatus = ready && detectJob.running ? `${detectJob.count}/${detectJob.total}` : ''
    const checkInStatus = ready && checkInJob.running ? `${checkInJob.count}/${checkInJob.total}` : ''

    return (
      <div>
        <Button
          type="primary"
          onClick={this.handleStart}
          loading={checkInLoading}
          style={{ marginRight: 20 }}
        >
          {`开始 ${checkInStatus}`}
        </Button>

        <Button
          type="primary"
          onClick={this.handleDetect}
          loading={detectLoading}
        >
          {`检测 ${detectStatus}`}
        </Button>

        <AccountsTable />
      </div>
    )
  }
})
