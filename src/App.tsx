import { AirtableService } from './services/AirtableService';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { StripeService } from './services/StripeService';
import { ThemeProvider } from '@material-ui/core';
import { configureStore } from './store/configureStore';
import { routePaths } from './common/router';
import AboutPage from './pages/AboutPage';
import CartDialog from './components/CartDialog';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import DonatePage from './pages/DonatePage';
import DriversPage from './pages/DriversPage';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LocationsDialog from './components/LocationsDialog';
import ProductsPage from './pages/ProductsPage';
import React from 'react';
import theme from './common/theme';

const store = configureStore();
AirtableService.init(store);
StripeService.init(store);

// must also update routePaths /src/common/router.ts
const routeComponents: Record<string, React.FC> = {
  home: HomePage,
  about: AboutPage,
  products: ProductsPage,
  donate: DonatePage,
  drivers: DriversPage,
  cart: CartPage,
  checkout: CheckoutPage,
  confirmation: ConfirmationPage,
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <Header />
          <Switch>
            {Object.keys(routeComponents).map((routeId) => (
              <Route key={routeId} path={routePaths[routeId]} component={routeComponents[routeId]} exact={true} />
            ))}
          </Switch>
          <CartDialog />
          <LocationsDialog />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
