import { CMSService } from './services/CMSService';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import { configureStore } from './store/configureStore';
import BoxPage from './pages/Box';
import BoxesHome from './pages/Boxes';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import React from 'react';
import theme from './common/theme';

const store = configureStore();
CMSService.init(store);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <Switch>
            <Route path="/boxes">
              <BoxesHome />
            </Route>
            <Route path="/box_details">
              <BoxPage />
            </Route>
            <Route path="/checkout">
              <CheckoutPage />
            </Route>
            <Route path="/" component={HomePage} />
          </Switch>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
