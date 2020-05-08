import { IDonationSummary, IOrderSummary, OrderType } from '../common/types';

export const deliveryOrderConfirmation: IOrderSummary = {
  id: '85',
  createdAt: '2020-05-08T21:22:02.000Z',
  deliveryAddress: {
    city: 'Portola Valley',
    state: 'TX',
    street1: '333 Ramona Rd',
    zip: '35566',
  },
  deliveryPreferences: ['Mornings', 'Weekends'],
  email: 'ryanrrowe@gmail.com',
  fullName: 'Ryan Rowe',
  items: [
    { id: 'recwKKxpcBBFteKdG', quantity: 1 },
    { id: 'recSmc0lCgRXWKe3J', quantity: 2 },
  ],
  phone: '(650) 704-2755',
  status: 'Paid',
  stripePaymentId: 'pi_1GgddrIqtawOMk0tlvd7cQIL',
  subtotal: 70,
  tax: 5.95,
  total: 75.95,
  type: OrderType.DELIVERY,
};

export const pickupOrderConfirmation: IOrderSummary = {
  id: '85',
  createdAt: '2020-05-08T21:22:02.000Z',
  pickupLocationId: 'recmwjPFHCNPsbUux',
  email: 'ryanrrowe@gmail.com',
  fullName: 'Ryan Rowe',
  items: [
    { id: 'recwKKxpcBBFteKdG', quantity: 1 },
    { id: 'recSmc0lCgRXWKe3J', quantity: 2 },
  ],
  phone: '(650) 704-2755',
  status: 'Paid',
  stripePaymentId: 'pi_1GgddrIqtawOMk0tlvd7cQIL',
  subtotal: 70,
  tax: 5.95,
  total: 75.95,
  type: OrderType.PICKUP,
};

export const donationConfirmation: IDonationSummary = {
  id: '85',
  createdAt: '2020-05-08T21:22:02.000Z',
  email: 'ryanrrowe@gmail.com',
  fullName: 'Ryan Rowe',
  phone: '(650) 704-2755',
  stripePaymentId: 'pi_1GgddrIqtawOMk0tlvd7cQIL',
  total: 50,
};
