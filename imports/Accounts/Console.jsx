import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Table, message } from 'antd'
import EditableCell from './EditableCell.jsx'

import { Accounts } from '/lib/collections.js'

class Console extends Component {
  onCellChange (id, value) {
    Meteor.call('accounts.update', id, value, err => {
      if (err) {
        message.error('修改失败')
      } else {
        message.success('修改成功')
      }
    })
  }

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
        <Table.Column title="使用类型" dataIndex="for" render={(text, record, index) => {
          return (<EditableCell
            value={text}
            onChange={value => this.onCellChange(record._id, value)}
          />)
        }}/>
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
