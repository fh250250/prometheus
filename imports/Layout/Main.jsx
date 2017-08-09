import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { Layout, Icon, Button } from 'antd'
import { NavLink, BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'

import Words from '/imports/Words/index.jsx'
import Accounts from '/imports/Accounts/index.jsx'
import Tasks from '/imports/Tasks/index.jsx'
import Proxy from '/imports/Proxy/index.jsx'

import s from './Main.css'

export default class Main extends Component {
  constructor (props) {
    super(props)

    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout () {
    Meteor.logout()
  }

  render () {
    const { username } = this.props

    return (
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Layout.Sider style={{ textAlign: 'center' }}>
            <h1 className={ s.logo }>Prometheus</h1>
            <h2 className={ s.user }>
              <Icon type="user" />
              <span style={{ marginLeft: '20px' }}>{ username }</span>
            </h2>

            <ul className={ s.nav }>
              <li><NavLink activeClassName="active" to="/tasks">任务</NavLink></li>
              <li><NavLink activeClassName="active" to="/words">话术</NavLink></li>
              <li><NavLink activeClassName="active" to="/accounts">账号</NavLink></li>
              <li><NavLink activeClassName="active" to="/proxy">代理</NavLink></li>
            </ul>

            <Button type="danger" className={ s.logout } onClick={ this.handleLogout }>退出</Button>
          </Layout.Sider>

          <Layout.Content style={{ padding: '20px' }}>
            <Switch>
              <Route path="/words" component={ Words } />
              <Route path="/accounts" component={ Accounts } />
              <Route path="/tasks" component={ Tasks } />
              <Route path="/proxy" component={ Proxy } />
              <Redirect to="/tasks" />
            </Switch>
          </Layout.Content>
        </Layout>
      </BrowserRouter>
    )
  }
}
