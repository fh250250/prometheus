import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Button, Table, Progress, message } from 'antd'

import { Proxy, Jobs } from '/lib/collections.js'

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
    const { list, ready } = this.props

    const data = list.map(p => ({
      ...p,
      key: p._id,
      rate: p.times === 0 ? 0 : Math.floor(p.success*100 / p.times) + '%'
    }))

    return (
      <Table
        loading={!ready}
        dataSource={data}
        bordered
        style={{ backgroundColor: 'white' }}
      >
        <Table.Column title="地址" dataIndex="addr" />
        <Table.Column title="使用次数" dataIndex="times" />
        <Table.Column title="成功次数" dataIndex="success" />
        <Table.Column title="成功率" dataIndex="rate" />
      </Table>
    )
  }

  renderProgress () {
    const { ready, job } = this.props

    if (!ready) { return null }

    const percent = job.progress.total
      ? Math.floor(job.progress.current / job.progress.total * 100)
      : 0

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Progress
          percent={percent}
          style={{ width: 200, marginRight: 10 }}
        />
        <span>{`[${job.progress.current}/${job.progress.total}]`}</span>
      </div>
    )
  }

  render () {
    const { list, job, ready } = this.props

    return (
      <div>
        <div className={s.header}>
          <Button
            type="primary"
            loading={!ready || job.running}
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
  const jobHandle = Meteor.subscribe('jobs.proxy')

  return {
    list: Proxy.find({}, { sort: { times: -1 } }).fetch(),
    job: Jobs.findOne({ name: 'proxy' }),
    ready: proxyHandle.ready() && jobHandle.ready(),
  }
}, ProxyComp)
