import 'antd/dist/antd.css'

import { Meteor } from 'meteor/meteor'
import moment from 'moment'
import React from 'react'
import { render } from 'react-dom'
import App from '/imports/App.jsx'

moment.locale('zh-cn')
Meteor.startup(() => render(<App />, document.getElementById('root')))
