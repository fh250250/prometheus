import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { InputNumber, Form, Button, message, Progress, Row, Col, Spin } from 'antd'

import { Jobs } from '/lib/collections.js'

class Register extends Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (ev) {
    const { form, forType, extra } = this.props
    ev.preventDefault()

    form.validateFields((err, values) =>  {
      if (err) { return }

      Meteor.call('accounts.register', values.count, forType, extra, err => {
        if (err) {
          message.error('注册失败')
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
            <InputNumber size="small" min={1} max={100} disabled={disabled} />
          )}
        </Form.Item>

        <Form.Item>
          <Button size="small" type="primary" htmlType="submit" disabled={disabled}>
            注册
          </Button>
        </Form.Item>
      </Form>
    )
  }

  renderStatus () {
    const { ready, job } = this.props

    if (!ready) { return null }

    const percent = job.total ? Math.floor((job.success + job.failure) / job.total * 100) : 0

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Progress style={{ width: 200 }} percent={percent}/>
        <span style={{ marginRight: 20 }}>{`[${job.success + job.failure}/${job.total}]`}</span>
        <span style={{ marginRight: 20 }}>成功: {job.success}</span>
        <span>失败: {job.failure}</span>
      </div>
    )
  }

  render () {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {this.renderForm()}
        {this.renderStatus()}
      </div>
    )
  }
}

const WrapRegister = Form.create()(Register)

export default createContainer(props => {
  const jobHandle = Meteor.subscribe('jobs.register')

  return {
    ...props,
    job: Jobs.findOne({ name: 'accounts.register' }),
    ready: jobHandle.ready(),
  }
}, WrapRegister)
