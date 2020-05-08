import qs from 'qs';

// must also update routeComponents in /src/App.tsx
export type RouteId = 'home' | 'about' | 'products' | 'donate' | 'drivers' | 'cart' | 'checkout' | 'confirmation';
export const routePaths: Record<string, string> = {
  home: '/',
  about: '/about',
  products: '/products',
  donate: '/donate',
  drivers: '/drivers',
  cart: '/cart',
  checkout: '/checkout',
  confirmation: '/confirmation',
};

export function reverse(routeId: RouteId, params?: Record<string, any>): string {
  const query = params ? `?${qs.stringify(params)}` : '';
  return `${routePaths[routeId]}${query}`;
}
