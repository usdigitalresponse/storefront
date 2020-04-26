import { IRoute } from './types';
import HomePage from '../pages/HomePage';

export const routes: Record<string, IRoute> = {
  home: { path: '/', component: HomePage },
  about: { path: '/about', component: HomePage },
  products: { path: '/products', component: HomePage },
  donate: { path: '/donate', component: HomePage },
  drivers: { path: '/drivers', component: HomePage },
};

export function reverse(routeId: string): string {
  return routes[routeId].path;
}
