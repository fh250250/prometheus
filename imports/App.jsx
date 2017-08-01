import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { Spin } from 'antd'

import Login from './Layout/Login.jsx'
import Main from './Layout/Main.jsx'

function Loading (props) {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Spin size="large" />
    </div>
  )
}

class App extends Component {
  render () {
    const { user, loggingIn } = this.props

    if (loggingIn) { return <Loading /> }

    return user ? <Main username={ user.username } /> : <Login />
  }
}

export default createContainer(() => ({
  user: Meteor.user(),
  loggingIn: Meteor.loggingIn()
}), App)
