import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import Home from './views/Home'
import List from './views/List'
import Preview from './views/Preview'
import NavBar from './components/NavBar'
import ProductView from './views/ProductView'
import ProductCreate from './views/ProductCreate'
import ProductEdit from './views/ProductEdit'

const App: React.FC = (): JSX.Element => {
  return (
    <BrowserRouter basename="/">
      <NavBar />

      <Switch>
        <Route exact path="/" component={Home} />

        <Route exact path="/products" component={List} />

        <Route exact path="/products/create" component={ProductCreate} />

        <Route exact path="/products/:id/edit" component={ProductEdit} />

        <Route exact path="/products/:id" component={ProductView} />

        <Route path="/preview" component={Preview} />
      </Switch>
    </BrowserRouter>
  )
}

export default App
