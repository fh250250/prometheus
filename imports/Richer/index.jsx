import React, { Component } from 'react'
import { Tabs } from 'antd'

import Stage1 from './Stage1.jsx'
import Stage2 from './Stage2.jsx'

export default class Richer extends Component {
  render () {
    return (
      <Tabs>
        <Tabs.TabPane tab="注册/绑定" key="1">
          <Stage1 />
        </Tabs.TabPane>
        <Tabs.TabPane tab="签到" key="2">
          <Stage2 />
        </Tabs.TabPane>
      </Tabs>
    )
  }
}
