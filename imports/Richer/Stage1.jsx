import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { Table, Form, Input, Button, InputNumber, message } from 'antd'

import Register from '/imports/Accounts/Register.jsx'
import { Accounts, Jobs } from '/lib/collections.js'

const AccountsTable = createContainer(() => {
  const accountsHandle = Meteor.subscribe('accounts')

  return {
    ready: accountsHandle.ready(),
    accounts: Accounts.find({ for: 'RICHER', new: true }).fetch()
  }
}, class extends Component {
  render () {
    const { accounts, ready } = this.props

    return (
      <Table
        rowKey="_id"
        dataSource={accounts}
        loading={!ready}
        bordered
        title={() => `个数: ${accounts.length}`}
        style={{ backgroundColor: 'white', margin: '10px 0' }}
      >
        <Table.Column title="账号" dataIndex="username" />
        <Table.Column title="密码" dataIndex="password" />
        <Table.Column title="昵称" dataIndex="nickname" />
      </Table>
    )
  }
})

const BindForm = createContainer(() => {
  const jobHandle = Meteor.subscribe('jobs.richer.bind')

  return {
    ready: jobHandle.ready(),
    job: Jobs.findOne({ name: 'richer.bind' })
  }
}, Form.create()(class extends Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (ev) {
    const { form } = this.props
    ev.preventDefault()

    form.validateFields((err, values) =>  {
      if (err) { return }

      Meteor.call('richer.bind', values.count, values.code, err => {
        if (err) {
          message.error(err.reason)
        }
      })
    })
  }

  render () {
    const { form, ready, job } = this.props

    const disabled = !ready || job.running

    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <Form.Item label="个数">
          {form.getFieldDecorator('count', {
            rules: [{ required: true, message: '请填写个数' }],
            initialValue: 10
          })(
            <InputNumber min={1} max={100} disabled={disabled} />
          )}
        </Form.Item>

        <Form.Item label="邀请码">
          {form.getFieldDecorator('code', {
            rules: [{ required: true, message: '请填写邀请码' }]
          })(
            <Input placeholder="邀请码" disabled={disabled} />
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={disabled}>
            绑定
          </Button>
        </Form.Item>
      </Form>
    )
  }
}))


export default class Stage1 extends Component {
  render () {
    return (
      <div>
        <Register forType="RICHER" extra={{ new: true }} />
        <AccountsTable />
        <BindForm />
      </div>
    )
  }
}
