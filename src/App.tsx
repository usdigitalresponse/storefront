import { CMSService } from './services/CMSService';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import { configureStore } from './store/configureStore';
import { routePaths } from './common/router';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import React from 'react';
import theme from './common/theme';

const store = configureStore();
CMSService.init(store);

// must also update routePaths /src/common/router.ts
const routeComponents: Record<string, React.FC> = {
  home: HomePage,
  about: HomePage,
  products: HomePage,
  donate: HomePage,
  drivers: HomePage,
  cart: CartPage,
  checkout: CheckoutPage,
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <Switch>
            {Object.keys(routeComponents).map(routeId => (
              <Route key={routeId} path={routePaths[routeId]} component={routeComponents[routeId]} exact={true} />
            ))}
          </Switch>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
