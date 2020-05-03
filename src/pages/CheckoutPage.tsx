import { Elements } from '@stripe/react-stripe-js';
import { getStripePromise } from '../store/cms';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import CheckoutForm from '../components/CheckoutForm';
import React from 'react';

export default function CheckoutPage() {
  const stripePromise = useSelector(getStripePromise());

  return (
    <BaseLayout>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </BaseLayout>
  );
}
