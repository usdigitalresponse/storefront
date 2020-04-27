import { Elements } from '@stripe/react-stripe-js';
import { getStripePromise } from '../store/cms';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import CheckoutForm from '../components/CheckoutForm';
import Loading from '../components/Loading';
import React from 'react';

export default function CheckoutPage() {
  const stripePromise = useSelector(getStripePromise());

  return (
    <BaseLayout>
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : (
        <Loading />
      )}
    </BaseLayout>
  );
}
