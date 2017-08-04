import React, { Component } from 'react'
import { Tabs } from 'antd'
import Console from './Console.jsx'
const TabPane = Tabs.TabPane

export default class Words extends Component {
  render () {
    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="主话术" key="1">
          <Console type="main" name="主话术" />
        </TabPane>
        <TabPane tab="前缀" key="2">
          <Console type="prefix" name="前缀" />
        </TabPane>
      </Tabs>
    )
  }
}
