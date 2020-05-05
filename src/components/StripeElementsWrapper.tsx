import { Elements } from '@stripe/react-stripe-js';
import { IAppState } from '../store/app';
import { Stripe } from '@stripe/stripe-js';
import { stripePromiseSelector } from '../store/cms';
import { useSelector } from 'react-redux';
import React from 'react';

const StripeElementsWrapper: React.FC = ({ children }) => {
  const stripePromise = useSelector<IAppState, Promise<Stripe | null> | null>(stripePromiseSelector);
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeElementsWrapper;
