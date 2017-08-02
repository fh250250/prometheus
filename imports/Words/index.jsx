import React, { Component } from 'react'
import { Row, Col } from 'antd'
import Console from './Console.jsx'

export default class Words extends Component {
  render () {
    return (
      <Row type="flex">
        <Col span={12}><Console type="main" name="主话术" /></Col>
        <Col span={12}><Console type="prefix" name="前缀" /></Col>
      </Row>
    )
  }
}
