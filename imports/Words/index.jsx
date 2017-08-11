import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { Input, Button, Form, message, Collapse } from 'antd'

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
        <Collapse style={{ marginBottom: 20 }}>
          <Collapse.Panel key="1" header="模板用法">
            <div>
              {'{sym}'} 插入标点符号<br/>
              {'{emoji}'} 插入 emoji 表情<br/>
              {'{text}'} 插入字符表情<br/>
            </div>
          </Collapse.Panel>
        </Collapse>

        <Form.Item>
          {form.getFieldDecorator('content', {
            initialValue: content
          })(
            <Input.TextArea
              style={{ fontSize: 16 }}
              autosize={{ minRows: 20, maxRows: 30 }}
              disabled={!ready} />
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
