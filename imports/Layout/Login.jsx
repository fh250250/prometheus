import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { Form, Icon, Input, Button, message } from 'antd'
import s from './Login.css'

class Login extends Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (ev) {
    const { form } = this.props
    ev.preventDefault()

    form.validateFields((err, values) => {
      if (err) { return }

      Meteor.loginWithPassword({ username: values.username }, values.password, err => {
        if (err) {
          message.error(err.reason)
        } else {
          message.success('登陆成功')
          Meteor.logoutOtherClients()
        }
      })
    })
  }

  render () {
    const { getFieldDecorator } = this.props.form

    return (
      <div className={ s.root }>
        <Form onSubmit={ this.handleSubmit } className={ s.form }>
          <Form.Item>
            {
              getFieldDecorator('username', {
                rules: [{ required: true, message: '请输入用户名' }],
              })(
                <Input prefix={ <Icon type="user"/> } placeholder="用户名" />
              )
            }
          </Form.Item>

          <Form.Item>
            {
              getFieldDecorator('password', {
                rules: [{ required: true, message: '请输入密码' }],
              })(
                <Input prefix={ <Icon type="lock"/> } type="password" placeholder="密码" />
              )
            }
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className={ s.submit }>
              登陆
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

export default Form.create()(Login)
