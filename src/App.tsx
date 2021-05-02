import { AirtableService } from './services/AirtableService';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { StripeService } from './services/StripeService';
import { configureStore } from './store/configureStore';
import { routePaths } from './common/router';
import CartDialog from './components/CartDialog';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import DonatePage from './pages/DonatePage';
import DriverRoute from './components/DriverRoute';
import DriversPage from './pages/DriversPage';
import FAQPage from './pages/FAQPage';
import FarmersPage from './pages/FarmersPage';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LocationsDialog from './components/LocationsDialog';
import MuiThemeWrapper from './components/MuiThemeWrapper';
import NotEligiblePage from './pages/NotEligiblePage';
import NotFoundPage from './pages/NotFoundPage';
import ProductPage from './pages/ProductPage';
import ProductsPage from './pages/ProductsPage';
import React from 'react';
import SchemaPage from './pages/SchemaPage';
import ScrollToTop from './components/ScrollToTop';

const store = configureStore();
AirtableService.init(store);
StripeService.init(store);

// must also update routePaths /src/common/router.ts
const routeComponents: Record<string, React.FC> = {
  home: HomePage,
  products: ProductsPage,
  product: ProductPage,
  donate: DonatePage,
  drivers: DriversPage,
  cart: CartPage,
  checkout: CheckoutPage,
  confirmation: ConfirmationPage,
  schema: SchemaPage,
  noteligible: NotEligiblePage,
  faq: FAQPage,
  farmers: FarmersPage
};

function App() {
  return (
    <Provider store={store}>
      <MuiThemeWrapper>
        <Router>
          <Header />
          <Switch>
            {Object.keys(routeComponents).map((routeId) => (
              <Route key={routeId} path={routePaths[routeId]} component={routeComponents[routeId]} exact={true} />
            ))}
            <DriverRoute />
            <Route component={NotFoundPage} />
          </Switch>
          <CartDialog />
          <LocationsDialog />
          <ScrollToTop />
        </Router>
      </MuiThemeWrapper>
    </Provider>
  );
}

export default App;
