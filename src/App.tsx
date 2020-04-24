import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import Home from './pages/Home';
import DriveWithUs from './pages/Driver';
import BoxesHome from './pages/Boxes';

import styles from './App.module.scss';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/drive">Drivers and Distributors</Link>
            </li>
            <li>
              <Link to="/boxes">Order a Box</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/drive">
            <DriveWithUs />
          </Route>
          <Route path="/boxes">
            <BoxesHome />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
