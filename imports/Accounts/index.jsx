import React, { Component } from 'react'
import Register from './Register.jsx'
import Console from './Console.jsx'

export default class Accounts extends Component {
  render () {
    return (
      <div>
        <Register forType="COMMENT" extra={{}} />
        <Console />
      </div>
    )
  }
}
