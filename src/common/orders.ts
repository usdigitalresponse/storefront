import { Order } from './types';

export function createOrder(order: Order) {
  return fetch('/.netlify/functions/create-order', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  }).then((response) => response.json());
}
