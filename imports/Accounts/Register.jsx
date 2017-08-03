import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { InputNumber, Form, Button, message } from 'antd'

import { Jobs } from '/lib/collections.js'

class Register extends Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (ev) {
    const { form } = this.props
    ev.preventDefault()

    form.validateFields((err, values) =>  {
      if (err) { return }

      Meteor.call('accounts.register', values.count, err => {
        if (err) {
          message.error('注册失败')
        } else {
          message.success('成功')
        }
      })
    })
  }

  renderForm () {
    const { form, ready, job } = this.props

    const disabled = !ready || job.running

    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <Form.Item label="个数">
          {form.getFieldDecorator('count', {
            rules: [{ required: true, message: '请指定个数' }],
            initialValue: 10
          })(
            <InputNumber min={1} max={100} disabled={disabled} />
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={disabled}>
            注册
          </Button>
        </Form.Item>
      </Form>
    )
  }

  renderStatus () {
    const { ready, job } = this.props

    if (!ready) { return null }

    return (
      <div>
        Running: {job.running ? 'yes': 'no'} |
        Total: {job.total} |
        Success: {job.success} |
        Failure: {job.failure}
      </div>
    )
  }

  render () {
    return (
      <div>
        {this.renderForm()}
        {this.renderStatus()}
      </div>
    )
  }
}

const WrapRegister = Form.create()(Register)

export default createContainer(() => {
  const jobHandle = Meteor.subscribe('jobs.register')

  return {
    job: Jobs.findOne({ name: 'accounts.register' }),
    ready: jobHandle.ready(),
  }
}, WrapRegister)
