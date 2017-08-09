import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Table, message, Button } from 'antd'

import { Accounts } from '/lib/collections.js'

class Console extends Component {
  constructor (props) {
    super(props)

    this.renderFor = this.renderFor.bind(this)
    this.handleExchange = this.handleExchange.bind(this)
  }

  handleExchange (account) {
    const type = account.for === 'COMMENT' ? 'LIKE' : 'COMMENT'

    Meteor.call('accounts.changeFor', account._id, type, err => {
      if (err) {
        message.error('失败')
      }
    })
  }

  renderFor (_, account) {
    const forMap = {
      COMMENT: '评论',
      LIKE: '点赞'
    }

    return (
      <div>
        <span style={{ marginRight: 10 }}>{forMap[account.for]}</span>
        <Button onClick={() => this.handleExchange(account)} size="small" type="ghost">转换</Button>
      </div>
    )
  }

  renderTable (accounts) {
    const { ready } = this.props

    return (
      <Table
        rowKey="_id"
        dataSource={accounts}
        loading={!ready}
        bordered
        size="small"
        title={() => `个数: ${accounts.length}`}
        style={{ backgroundColor: 'white', margin: '10px 0' }}
      >
        <Table.Column title="账号" dataIndex="username" />
        <Table.Column title="昵称" dataIndex="nickname" />
        <Table.Column title="密码" dataIndex="password" />
        <Table.Column title="使用次数" dataIndex="times" />
        <Table.Column title="使用类型" key="for" render={this.renderFor} />
      </Table>
    )
  }

  render () {
    const { accountsForComment, accountsForLike } = this.props

    return (
      <div>
        {this.renderTable(accountsForComment)}
        {this.renderTable(accountsForLike)}
      </div>
    )
  }
}

export default createContainer(({ type, name }) => {
  const accountsHandle = Meteor.subscribe('accounts')

  return {
    accountsForComment: Accounts.find({ for: 'COMMENT' }, { sort: { times: -1 } }).fetch(),
    accountsForLike: Accounts.find({ for: 'LIKE' }, { sort: { times: -1 } }).fetch(),
    ready: accountsHandle.ready(),
  }
}, Console)
