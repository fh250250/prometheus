import 'antd/dist/antd.css'

import { Meteor } from 'meteor/meteor'
import React from 'react'
import { render } from 'react-dom'
import App from '/imports/App.jsx'

Meteor.startup(() => render(<App />, document.getElementById('root')))
