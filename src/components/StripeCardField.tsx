import { CardElement } from '@stripe/react-stripe-js';
import { SetError } from '../store/checkout';
import { StripeCardElementOptions } from '@stripe/stripe-js';
import { Typography, useTheme } from '@material-ui/core';
import { useDispatch } from 'react-redux';
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
  errorMessage?: string;
  className?: string;
}

const StripeCardField: React.FC<Props> = ({ errorMessage, className }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  function onChange() {
    dispatch(SetError.create(undefined));
  }

  return (
    <>
      <div
        className={classNames(styles.container, className)}
        style={{ borderColor: errorMessage ? theme.palette.error.main : undefined }}
      >
        <CardElement onChange={onChange} options={cardOptions} />
      </div>
      {errorMessage && (
        <Typography variant="body2" color="error" className={styles.errorMessage}>
          {errorMessage}
        </Typography>
      )}
    </>
  );
};

export default StripeCardField;
