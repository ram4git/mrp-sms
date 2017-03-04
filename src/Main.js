import React, {Component} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {requireAuth} from './auth';
import Site from './Site';
import Home from './Home';
import Login from './Login';
import App from './App';
import Orders from './Orders';

class Main extends Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route component={Site}>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route onEnter={requireAuth}>
            {/* Place all authenticated routes here */}
            <Route path="/admin/console" component={App} />
            <Route path="/admin/orders" component={Orders} />

          </Route>
        </Route>
      </Router>
    );
  }
}

export default Main;
