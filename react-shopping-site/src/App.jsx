import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { Route, Switch } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import Container from '@material-ui/core/Container'

import './App.scss'

import Navbar from './components/Navbar'
import Home from './components/Pages/Home'
import About from './components/Pages/About'
import Shopping from './components/Pages/Shopping'
import Cart from './components/Context/Cart/Cart'
import Contact from './components/Pages/Contact'
import PageNotFound from './components/Pages/PageNotFound'

class ScrollToTop extends Component {
  // componentDidUpdate(prevProps) {
  //   // console.log(prevProps.location.pathname);
  //   // if (this.props.location.pathname !== prevProps.location.pathname) {
  //   window.scrollTo(0, 0);
  //   // }
  // }
  render() {
    window.scrollTo(0, 0)
    return this.props.children
  }
}
const Scroll = withRouter(ScrollToTop)

export default function App() {
  return (
    <div>
      <Navbar />
      <Container className="marginTop">
        <Scroll>
          <Route
            render={({ location }) => (
              <TransitionGroup>
                <CSSTransition key={location.key} timeout={450} classNames="fade">
                  <Switch location={location}>
                    <Route exact path="/" component={Home} />
                    <Route path="/about" component={About} />
                    <Route path="/shopping" component={Shopping} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/cart" component={Cart} />
                    <Route component={PageNotFound} />
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
            )}
          />
        </Scroll>
      </Container>
    </div>
  )
}
