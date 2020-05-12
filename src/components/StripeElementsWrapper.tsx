import { Elements } from '@stripe/react-stripe-js';
import { IAppState } from '../store/app';
import { Stripe } from '@stripe/stripe-js';
import { stripePromiseSelector } from '../store/cms';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import Loading from './Loading';
import React from 'react';

interface Props {
  type: 'donation' | 'main';
}

const StripeElementsWrapper: React.FC<Props> = ({ children, type }) => {
  const stripePromise = useSelector<IAppState, Promise<Stripe | null> | null>(stripePromiseSelector(type));

  // do not render if stripe object is not a promise yet.
  if (Promise.resolve(stripePromise) !== stripePromise) {
    return (
      <BaseLayout>
        <Loading />
      </BaseLayout>
    );
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeElementsWrapper;
