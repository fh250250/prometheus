import { Meteor } from 'meteor/meteor'
import moment from 'moment'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Table, Row, Col, Modal, message } from 'antd'

import AddForm from './AddForm.jsx'
import EditForm from './EditForm.jsx'
import EditableCell from './EditableCell.jsx'
import { Words } from '/lib/collections.js'

const confirm = Modal.confirm

class Console extends Component {
  constructor (props) {

    super(props)

    this.state = {
      uVisible: false,
      currentId: '',
      currentWord: ''
    }
  }

  onCellChange = (id, value) => {
    Meteor.call('words.update', id, value, err => {
      if (err) {
        message.error('修改失败')
      } else {
        message.success('修改成功')
      }
    })
  }

  handleRemove (_id) {
    confirm({
      title: '删除提示',
      content: '确认删除该条话术吗',
      onOk() {
        return new Promise((resolve, reject) => {
          Meteor.call('words.remove', _id, err => {
            if (err) {
              message.error('删除失败')
              reject()
            } else {
              message.success('删除成功')
              resolve()
            }
          })
        })
      }
    });
  }

  renderTable () {
    const { words, name, ready } = this.props

    const data = words.map(w => ({
      ...w,
      key: w._id
    }))

    return (
      <Table
        dataSource={data}
        loading={!ready}
        bordered
        style={{ backgroundColor: 'white' }}
      >
        <Table.Column title={name} dataIndex="content" render={(text, record, index) => (
          <EditableCell
            value={text}
            onChange={(value) => this.onCellChange(record._id, value)}
          />
        )} />
        <Table.Column title="时间" dataIndex="date" render={date => moment(date).fromNow()} />
        <Table.Column title="操作" dataIndex="_id" render={(_id, record) => (
          <Row>
            <Col span={12}><a onClick={() => this.handleRemove(_id)}>删除</a></Col>
          </Row>
        )}/>
      </Table>
    )
  }

  render () {
    const { type, name } = this.props
    const { uVisible, currentId, currentWord } = this.state
    return (
      <div>
        <AddForm type={type} name={name} />
        {this.renderTable()}
        <EditForm close={this.closeEditModal} visible={uVisible} id={currentId} word={currentWord} />
      </div>
    )
  }
}

export default createContainer(({ type, name }) => {
  const wordsHandle = Meteor.subscribe('words')

  return {
    words: Words.find({ type }).fetch(),
    ready: wordsHandle.ready(),
    type,
    name,
  }
}, Console)
