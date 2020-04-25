export const routes: Record<string, string> = {
  home: '/',
  products: '/products',
  donate: '/donate',
  drivers: '/drivers',
};

export function reverse(routeId: string): string {
  return routes[routeId];
}
