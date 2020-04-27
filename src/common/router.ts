// must also update routeComponents in /src/App.tsx
export const routePaths: Record<string, string> = {
  home: '/',
  about: '/about',
  products: '/products',
  donate: '/donate',
  drivers: '/drivers',
  cart: '/cart',
};

export function reverse(routeId: string): string {
  return routePaths[routeId];
}
