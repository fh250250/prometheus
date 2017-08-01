import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Button, Table, Progress, message } from 'antd'

import { Proxy, Status } from '/lib/collections.js'

import s from './index.css'

class ProxyComp extends Component {
  constructor (props) {
    super(props)

    this.handleFetch = this.handleFetch.bind(this)
  }

  handleFetch () {
    Meteor.call('proxy.crawl')
  }

  renderTable () {
    const data = this.props.list.map(p => ({
      ...p,
      key: p._id,
      failure: p.times - p.success
    }))

    return (
      <Table
        dataSource={data}
        bordered
        loading={!this.props.ready}
        style={{ backgroundColor: 'white' }}
      >
        <Table.Column title="地址" dataIndex="addr" key="addr" />
        <Table.Column title="使用次数" dataIndex="times" key="times" />
        <Table.Column title="成功次数" dataIndex="success" key="success" />
        <Table.Column title="失败次数" dataIndex="failure" key="failure" />
      </Table>
    )
  }

  renderProgress () {
    const { ready, status } = this.props

    if (ready && status.busy) {
      const percent = status.total ? (status.current / status.total * 100) : 0

      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Progress
            percent={Math.floor(percent)}
            style={{ width: 200, marginRight: 10 }}
          />
          <span>{`[${status.current}/${status.total}]`}</span>
        </div>
      )
    } else { return null }
  }

  render () {
    const { ready, status, list } = this.props

    return (
      <div>
        <div className={s.header}>
          <Button
            loading={!ready || status.busy}
            type="primary"
            onClick={this.handleFetch}
          >
            抓取
          </Button>

          <div style={{ margin: '0 20px' }}>总数: {list.length}</div>

          {this.renderProgress()}
        </div>

        {this.renderTable()}
      </div>
    )
  }
}

export default createContainer(() => {
  const proxyHandle = Meteor.subscribe('proxy.list')
  const statusHandle = Meteor.subscribe('status', 'proxy')

  return {
    list: Proxy.find({}).fetch(),
    status: Status.findOne({ name: 'proxy' }),
    ready: statusHandle.ready() && proxyHandle.ready()
  }
}, ProxyComp)
