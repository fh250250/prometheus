import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import moment from 'moment'
import { Table, Button, message, Form, InputNumber } from 'antd'

import { Tasks, Jobs } from '/lib/collections.js'

import Channels from './Channels.jsx'

const StartForm = Form.create()(class extends Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (ev) {
    const { form } = this.props
    ev.preventDefault()

    form.validateFields((err, values) =>  {
      if (err) { return }

      Meteor.call('tasks.run', values.count, err => {
        if (err) {
          message.error(err.reason)
        }
      })
    })
  }

  render () {
    const { form, loading } = this.props

    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <Form.Item label="个数">
          {form.getFieldDecorator('count', {
            rules: [{ required: true, message: '请指定个数' }],
            initialValue: 10
          })(
            <InputNumber size="small" min={1} max={50} disabled={loading} />
          )}
        </Form.Item>

        <Form.Item>
          <Button size="small" type="primary" htmlType="submit" disabled={loading}>
            开始
          </Button>
        </Form.Item>
      </Form>
    )
  }
})

class TasksComp extends Component {
  constructor (props) {
    super(props)

    this.handleDetect = this.handleDetect.bind(this)
    this.renderAction = this.renderAction.bind(this)
  }

  handleDetect () {
    Meteor.call('tasks.detect', err => {
      if (err) {
        message.error('失败')
      } else {
        message.success('成功')
      }
    })
  }

  renderAction (_, task) {
    return (
      <Button
        type="primary"
        size="small"
        onClick={() => Meteor.call('tasks.complete', task._id, !task.completed)}
      >
        {task.completed ? '继续' : '完成'}
      </Button>
    )
  }

  renderStart () {
    const { ready, tasksJob } = this.props

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 20, marginRight: 20 }}>未完成任务</span>
        <StartForm loading={!ready || tasksJob.running} />
      </div>
    )
  }

  renderDetect () {
    const { ready, detectJob } = this.props

    return (
      <div>
        <span style={{ fontSize: 20, marginRight: 20 }}>已完成任务</span>
        <Button
          type="primary"
          onClick={this.handleDetect}
          loading={!ready || detectJob.running}>检测</Button>
      </div>
    )
  }

  renderTable (completed) {
    const { ready, completedTasks, unCompletedTasks } = this.props

    const tasks = completed ? completedTasks : unCompletedTasks

    return (
      <Table
        rowKey="_id"
        dataSource={tasks}
        loading={!ready}
        size="small"
        bordered
        style={{ backgroundColor: 'white', margin: '20px 0' }}
        title={() => completed ? this.renderDetect() : this.renderStart()}
      >
        <Table.Column title="文章" key="article" render={(_, task) => {
          const url = `http://www.yidianzixun.com/article/${task.docid}`

          return <a href={url} target="_blank">{task.title}</a>
        }} />

        <Table.Column title="话术" dataIndex="words" />
        <Table.Column title="点赞数" dataIndex="like" />
        <Table.Column title="目标" dataIndex="target" />
        <Table.Column title="时间" dataIndex="date" render={date => moment(date).fromNow()} />
        <Table.Column title="操作" key="action" render={this.renderAction} />
      </Table>
    )
  }

  render () {
    return (
      <div>
        <Channels />
        {this.renderTable(false)}
        {this.renderTable(true)}
      </div>
    )
  }
}

export default createContainer(() => {
  const tasksHandle = Meteor.subscribe('tasks')
  const jobHandle = Meteor.subscribe('jobs.tasks')

  return {
    ready: tasksHandle.ready() && jobHandle.ready(),
    completedTasks: Tasks.find({ completed: true }).fetch(),
    unCompletedTasks: Tasks.find({ completed: false }).fetch(),
    tasksJob: Jobs.findOne({ name: 'tasks' }),
    detectJob: Jobs.findOne({ name: 'tasks.detect' }),
  }
}, TasksComp)
