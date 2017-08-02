import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Table } from 'antd'

import AddForm from './AddForm.jsx'
import { Words } from '/lib/collections.js'

class Console extends Component {
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
