import { IAppState } from '../store/app';
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DriversPage from '../pages/DriversPage';
import React from 'react';

const DriverRoute = React.forwardRef((props: any, ref) => {
  const driverFormName = useSelector<IAppState, string | undefined>((state) => state.cms.config.driverFormName);
  return driverFormName ? <Route path={`/${driverFormName}`} component={DriversPage} exact={true} /> : null;
});

export default DriverRoute;
