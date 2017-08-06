import React, { Component } from 'react'
import { Modal, Form, Input, Button, message } from 'antd'

class EditForm extends Component {

  constructor (props) {
    super(props)

    this.state = {
      visible: false,
      confirmLoading: false
    }
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleCancel () {
    this.props.close()
  }

  handleOk () {
    const { form, id } = this.props


    form.validateFields((err, values) => {
      if (err) { return }

      this.setState({ confirmLoading: true })
      Meteor.call('words.update', id, values.content, err => {
        if (err) {
          message.error('修改失败')
        } else {
          this.setState({ confirmLoading: false })
          message.success('修改成功')
          this.props.close()
        }
      })
    })
  }
 
  render () {
    const { form, visible } = this.props

    return (
      <Modal
        title="编辑话术"
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        confirmLoading={this.state.confirmLoading}
      >
        <Form>
          <Form.Item>
            {form.getFieldDecorator('content', {
              rules: [{ required: true, message: '请填写内容' }],
              valuePropName: 'value'
            })(
              <Input placeholder="内容" name="content" />
            )}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(EditForm)
