import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Table, message } from 'antd'

import { Accounts } from '/lib/collections.js'

class Console extends Component {
  render () {
    const { accounts, ready } = this.props

    const data = accounts.map(a => ({
      ...a,
      key: a._id
    }))

    return (
      <Table
        dataSource={data}
        loading={!ready}
        bordered
        style={{ backgroundColor: 'white' }}
      >
        <Table.Column title="账号" dataIndex="username" />
        <Table.Column title="昵称" dataIndex="nickname" />
        <Table.Column title="密码" dataIndex="password" />
        <Table.Column title="使用次数" dataIndex="times" />
        <Table.Column title="使用类型" dataIndex="for" />
      </Table>
    )
  }
}

export default createContainer(({ type, name }) => {
  const accountsHandle = Meteor.subscribe('accounts')

  return {
    accounts: Accounts.find({}).fetch(),
    ready: accountsHandle.ready(),
  }
}, Console)
