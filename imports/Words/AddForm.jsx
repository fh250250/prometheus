import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { Form, Input, Button, message } from 'antd'

class AddForm extends Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (ev) {
    const { form, type, id } = this.props
    ev.preventDefault()

    form.validateFields((err, values) => {
      if (err) { return }

      id ? Meteor.call('words.update', id, values.content, err => {
        if (err) {
          message.error('修改失败')
        } else {
          message.success('修改成功')
          form.resetFields()
        }
      }) : Meteor.call('words.insert', type, values.content, err => {
        if (err) {
          message.error('新增失败')
        } else {
          message.success('新增成功')
          form.resetFields()
        }
      })
    })
  }

  render () {
    const { name, form } = this.props

    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <Form.Item>
          {form.getFieldDecorator('content', {
            rules: [{ required: true, message: '请填写内容' }]
          })(
            <Input placeholder="内容" />
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon="plus-circle-o">
            {name}
          </Button>
        </Form.Item>
      </Form>
    )
  }
}

export default Form.create()(AddForm)
