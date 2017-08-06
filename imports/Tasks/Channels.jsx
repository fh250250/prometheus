import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Tag, Form, Input, Button, message, Tooltip, Modal } from 'antd'

import { Channels } from '/lib/collections.js'

const AddForm = Form.create()(class Add extends Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (ev) {
    const { form } = this.props
    ev.preventDefault()

    form.validateFields((err, values) =>  {
      if (err) { return }

      Meteor.call('channels.insert', values.id, values.name, err => {
        if (err) {
          message.error('失败')
        } else {
          form.resetFields()
        }
      })
    })
  }

  render () {
    const { form } = this.props

    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <Form.Item label="ID">
          {form.getFieldDecorator('id', {
            rules: [{ required: true, message: '请填写 id' }]
          })(
            <Input placeholder="id" size="small" />
          )}
        </Form.Item>

        <Form.Item label="名称">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '请填写名称' }]
          })(
            <Input placeholder="名称" size="small" />
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="small">
            新增
          </Button>
        </Form.Item>
      </Form>
    )
  }
})

class ChannelsComp extends Component {
  handleRemove (ev, channel) {
    ev.preventDefault()

    Modal.confirm({
      title: '确定删除 ?',
      onOk () {
        Meteor.call('channels.remove', channel._id, err => {
          if (err) {
            message.error('失败')
          }
        })
      }
    })
  }

  renderChannels () {
    const { channels } = this.props

    return (
      <div style={{ marginTop: 10 }}>
        {channels.map(channel => (
          <Tooltip key={channel._id} title={channel.id}>
            <Tag
              color="green"
              closable
              onClose={ev => this.handleRemove(ev, channel)}
            >
              {channel.name}
            </Tag>
          </Tooltip>
        ))}
      </div>
    )
  }

  render () {
    return (
      <div style={{ backgroundColor: 'white', padding: 10 }}>
        <AddForm />
        {this.renderChannels()}
      </div>
    )
  }
}

export default createContainer(() => {
  const channelsHandle = Meteor.subscribe('channels')

  return {
    ready: channelsHandle.ready(),
    channels: Channels.find({}).fetch(),
  }
}, ChannelsComp)
