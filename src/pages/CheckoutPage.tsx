import { Elements } from '@stripe/react-stripe-js';
import { getStripePromise } from '../store/cms';
import { useSelector } from 'react-redux';
import CheckoutForm from './CheckoutForm';
import React from 'react';

export default function CheckoutPage() {
  const stripePromise = useSelector(getStripePromise());

  if (!stripePromise) {
    return <div>Loading...</div>;
  }
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
