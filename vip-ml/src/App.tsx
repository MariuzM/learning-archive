import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import NavBar from './components/NavBar'

// import HomePage from './views/HomePage'
import Rules from './views/Rules'
import Info from './views/Info'

export default function App(): JSX.Element {
  return (
    <>
      <BrowserRouter basename="/">
        <NavBar />

        <Switch>
          <Route exact path="/">
            <Rules />
          </Route>

          <Route exact path="/rules">
            <Rules />
          </Route>

          <Route exact path="/info">
            <Info />
          </Route>

          <Route path="/" render={(): JSX.Element => <div>404</div>} />
        </Switch>
      </BrowserRouter>

      {/* <div>Test</div> */}
    </>
  )
}
