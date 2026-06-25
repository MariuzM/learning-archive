import React, { Component } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';

class App extends Component {
  render() {
    return (
      <Router basename={'/build'}>
        <div className="App">
          <Navbar />
          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
        </div>
      </Router>
    );
  }
}

export default App;
