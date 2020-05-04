import { CardElement } from '@stripe/react-stripe-js';
import { StripeCardElementOptions } from '@stripe/stripe-js';
import React from 'react';
import classNames from 'classnames';
import styles from './StripeCardField.module.scss';

const cardOptions: StripeCardElementOptions = {
  style: {
    base: {
      iconColor: 'rgba(0, 0, 0, 0.87)',
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: '"Inter", Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: 'rgba(0, 0, 0, 0.38)',
      },
    },
    empty: {
      iconColor: 'rgba(0, 0, 0, 0.38)',
    },
    invalid: {
      color: '#f44336',
    },
  },
};

interface Props {
  className?: string;
}

const StripeCardField: React.FC<Props> = ({ className }) => {
  return (
    <div className={classNames(styles.container, className)}>
      <CardElement options={cardOptions} />
    </div>
  );
};

export default StripeCardField;
