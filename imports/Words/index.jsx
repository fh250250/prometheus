import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { Input, Button, Form, message } from 'antd'

import { Words } from '/lib/collections.js'

class WordsComp extends Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (ev) {
    const { form } = this.props
    ev.preventDefault()

    form.validateFields((err, values) => {
      if (err) { return }

      Meteor.call('words.upsert', values.content, err => {
        if (err) {
          message.error('失败')
        } else {
          message.success('成功')
        }
      })
    })
  }

  render () {
    const { ready, words, form } = this.props

    const content = words ? words.content : ''

    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('content', {
            initialValue: content
          })(
            <Input.TextArea rows={20} disabled={!ready} />
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={!ready}>确定</Button>
        </Form.Item>
      </Form>
    )
  }
}

const WordsForm = Form.create()(WordsComp)

export default createContainer(() => {
  const wordsHandle = Meteor.subscribe('words')

  return {
    ready: wordsHandle.ready(),
    words: Words.findOne({}),
  }
}, WordsForm)
