import { CMSService } from './services/CMSService';
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from './store/configureStore';
import BoxPage from './pages/Box';
import BoxesHome from './pages/Boxes';
import DriveWithUs from './pages/Driver';
import Home from './pages/Home';
import React from 'react';
// import styles from './App.module.scss';

const store = configureStore();
CMSService.init(store);

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div>
          <div />
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
            <Route path="/box_details">
              <BoxPage />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
