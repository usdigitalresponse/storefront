// must also update routeComponents in /src/App.tsx
export type RouteId = 'home' | 'about' | 'products' | 'donate' | 'drivers' | 'cart' | 'checkout';
export const routePaths: Record<string, string> = {
  home: '/',
  about: '/about',
  products: '/products',
  donate: '/donate',
  drivers: '/drivers',
  cart: '/cart',
  checkout: '/checkout',
};

export function reverse(routeId: RouteId): string {
  return routePaths[routeId];
}
