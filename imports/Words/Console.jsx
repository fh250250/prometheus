import { Meteor } from 'meteor/meteor'
import moment from 'moment'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Table } from 'antd'

import AddForm from './AddForm.jsx'
import { Words } from '/lib/collections.js'

function WordsForm (props) {
  return (
    <Form onSubmit={this.handleSubmit} layout="inline">
      <Form.Item>
        {form.getFieldDecorator('content', {
          rules: [{ required: true, message: '请填写内容' }]
        })(
          <Input placeholder="内容" />
        )}
      </Form.Item>
    </Form>
  )
}

class Console extends Component {
  state = {
    uVisible: false,
    rVisible: false
  }

  showUpdateModal () {
    this.setState({ uVisible: true })
  }

  showRemoveModal () {
    this.setState({ rVisible: true })
  }

  handleUpdate (_id) {
    
  }

  handleRemove (_id) {

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
        <Table.Column title={name} dataIndex="content" />
        <Table.Column title="时间" dataIndex="date" render={date => moment(date).fromNow()} />
        <Table.Column title="操作" dataIndex="_id" render={_id => (
          <div>
            <a onClick={this.showUpdateModal}>修改</a>
            <Modal title="Basic Modal" visible={this.state.uVisible} onOk={() => this.handleUpdate(_id)} onCancel={this.handleUCancel}>
              <AddForm type={type} name={name} id={_id}/>
            </Modal>
            <a onClick={this.showRemoveModal}>删除</a>
            <Modal title="Basic Modal" visible={this.state.rVisible} onOk={() => this.handleRemove(_id)} onCancel={this.handleRCancel}>
              <p>确认删除该条话术？</p>
            </Modal>
          </div>
        )}/> 
      </Table>
    )
  }

  render () {
    const { type, name } = this.props

    return (
      <div>
        <AddForm type={type} name={name} />
        {this.renderTable()}
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
