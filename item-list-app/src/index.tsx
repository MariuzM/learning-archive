import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { AppContextConsumer } from './utils/context'

import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/App.css'

ReactDOM.render(
  <React.StrictMode>
    <AppContextConsumer>
      <App />
    </AppContextConsumer>
  </React.StrictMode>,
  document.getElementById('root'),
)
