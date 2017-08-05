import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import moment from 'moment'
import { Table } from 'antd'

import { Tasks } from '/lib/collections.js'

class TasksComp extends Component {
  renderTable (completed) {
    const { ready, completedTasks, unCompletedTasks } = this.props

    const tasks = completed ? completedTasks : unCompletedTasks

    return (
      <Table
        rowKey="_id"
        dataSource={tasks}
        loading={!ready}
        bordered
        style={{ backgroundColor: 'white' }}
        title={() => (
          <h3 style={{ textAlign: 'center' }}>
            {completed ? '已完成' : '进行中'}
          </h3>
        )}
      >
        <Table.Column title="文章" key="article" render={(_, task) => {
          const url = `http://www.yidianzixun.com/article/${task.docid}`

          return <a href={url} target="_blank">{task.title}</a>
        }} />

        <Table.Column title="话术" dataIndex="words" />
        <Table.Column title="点赞数" dataIndex="like" />
        <Table.Column title="目标点赞数" dataIndex="target" />
        <Table.Column title="时间" dataIndex="date" render={date => moment(date).fromNow()} />
      </Table>
    )
  }

  render () {
    return (
      <div>
        {this.renderTable(false)}
        <div style={{ height: 20 }} />
        {this.renderTable(true)}
      </div>
    )
  }
}

export default createContainer(() => {
  const tasksHandle = Meteor.subscribe('tasks')

  return {
    ready: tasksHandle.ready(),
    completedTasks: Tasks.find({ completed: true }).fetch(),
    unCompletedTasks: Tasks.find({ completed: false }).fetch(),
  }
}, TasksComp)
