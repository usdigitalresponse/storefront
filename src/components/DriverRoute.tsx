import { IAppState } from '../store/app';
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DriversPage from '../pages/DriversPage';
import React from 'react';

const DriverRoute = React.forwardRef((props: any, ref) => {
  const embeddedViewName = useSelector<IAppState, string | undefined>((state) => state.cms.config.embeddedViewName);
  return embeddedViewName ? <Route path={`/${embeddedViewName}`} component={DriversPage} exact={true} /> : null;
});

export default DriverRoute;
