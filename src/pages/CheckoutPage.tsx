import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripePromise } from '../store/cms';
import { useSelector } from 'react-redux';
import CheckoutForm from './CheckoutForm';

export default function CheckoutPage() {
  const stripePromise = useSelector(getStripePromise());

  if (!stripePromise) {
    return null;
  }
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
