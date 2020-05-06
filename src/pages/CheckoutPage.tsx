import { Button, Card, CircularProgress, Grid, TextField, TextFieldProps, Typography } from '@material-ui/core';
import { CheckoutFormField, ICheckoutFormData, OrderType, PaymentStatus } from '../common/types';
import { IAppState } from '../store/app';
import { StripeService } from '../services/StripeService';
import { paymentStatusSelector } from '../store/checkout';
import { reverse } from '../common/router';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import DeliveryPreferences from '../components/DeliveryPreferences';
import OrderSummary from '../components/OrderSummary';
import OrderTypeView from '../components/OrderTypeView';
import PhoneField from '../components/PhoneField';
import React, { useEffect } from 'react';
import StateField from '../components/StateField';
import StripeCardField from '../components/StripeCardField';
import ZipCodeField from '../components/ZipCodeField';
import classNames from 'classnames';
import styles from './CheckoutPage.module.scss';
import StripeElementsWrapper from '../components/StripeElementsWrapper';

function CheckoutPageMain() {
  const { register, setValue, watch, handleSubmit, errors } = useForm<ICheckoutFormData>();
  const orderType = useSelector<IAppState, OrderType>((state) => state.cart.orderType);
  const defaultState = useSelector<IAppState, string | undefined>((state) => state.cms.defaultState);
  const isSmall = useIsSmall();
  const hasErrors = Object.keys(errors).length > 0;
  const stripe = useStripe();
  const elements = useElements();
  const paymentStatus = useSelector<IAppState, PaymentStatus>(paymentStatusSelector);
  const paymentError = useSelector<IAppState, string | undefined>((state) => state.checkout.error);
  const isPaying = paymentStatus === PaymentStatus.IN_PROGRESS;
  const history = useHistory();

  useEffect(() => {
    if (paymentStatus === PaymentStatus.SUCCEEDED) {
      history.push(reverse('confirmation'));
    }
  }, [paymentStatus, history]);

  function onSubmit(data: ICheckoutFormData) {
    StripeService.pay(data, stripe, elements);
  }

  function textFieldProps(label: string, name: CheckoutFormField, placeholder?: string): TextFieldProps {
    const error = errors[name];

    return {
      label,
      name,
      placeholder,
      error: !!error,
      helperText: error?.message,
      fullWidth: true,
      className: styles.field,
      variant: 'outlined',
    };
  }

  return (
    <BaseLayout>
      <form onSubmit={handleSubmit(onSubmit)} className={classNames(styles.container, { [styles.small]: isSmall })}>
        <Grid container spacing={2}>
          <Grid item md={8} xs={12}>
            {orderType !== OrderType.DONATION && <OrderTypeView />}
            <Card elevation={2} className={styles.form}>
              <Grid container className={styles.section}>
                <Typography variant="h3" className={styles.title}>
                  Contact Information
                </Typography>
                <Grid item md={8} xs={12}>
                  <TextField
                    {...textFieldProps('Name', 'fullName', 'First Last')}
                    inputRef={register({ required: 'Name is required' })}
                    autoCorrect="off"
                  />
                  <TextField
                    {...textFieldProps('Phone Number', 'phone')}
                    type="tel"
                    inputRef={register({ required: 'Phone Number is required' })}
                    InputProps={{ inputComponent: PhoneField }}
                  />
                  <TextField
                    {...textFieldProps('Email', 'email', 'name@domain.com')}
                    type="email"
                    inputRef={register({ required: 'Email is required' })}
                  />
                </Grid>
              </Grid>
              {orderType === OrderType.DELIVERY && (
                <>
                  <Grid container className={styles.section}>
                    <Typography variant="h3" className={styles.title}>
                      Delivery Preferences
                    </Typography>
                    <Grid item md={8} xs={12}>
                      <DeliveryPreferences inputRef={register} setValue={setValue} watch={watch} />
                    </Grid>
                  </Grid>
                  <Grid container className={styles.section}>
                    <Typography variant="h3" className={styles.title}>
                      Delivery Address
                    </Typography>
                    <Grid item md={8} xs={12}>
                      <TextField
                        {...textFieldProps('Street 1', 'street1', '123 Main St.')}
                        inputRef={register({ required: 'Street 1 is required' })}
                      />
                      <TextField
                        {...textFieldProps('Street 2', 'street2', 'Apt 4B, Floor 2, etc.')}
                        inputRef={register}
                      />
                      <TextField
                        {...textFieldProps('City', 'city', 'San Antonio')}
                        inputRef={register({ required: 'City is required' })}
                      />
                      <StateField
                        {...textFieldProps('State', 'state', 'CA')}
                        value={defaultState}
                        inputProps={{ readOnly: !!defaultState }}
                        inputRef={register({ required: 'State is required', maxLength: 2 })}
                      />
                      <ZipCodeField
                        {...textFieldProps('Zip Code', 'zip')}
                        inputRef={register({ required: 'Zip code is required', maxLength: 5 })}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
              <Grid container className={styles.section}>
                <Typography variant="h3" className={styles.title}>
                  Payment Details
                </Typography>
                <Grid item md={8} xs={12}>
                  <StripeCardField errorMessage={paymentError} />
                </Grid>
              </Grid>
            </Card>
          </Grid>
          <Grid item md={4} xs={12} container className={styles.right}>
            <div className={!isSmall ? styles.sidebar : undefined}>
              <OrderSummary className={styles.summary} showLineItems />
              <Button
                className={classNames({ [styles.readOnly]: isPaying })}
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={hasErrors}
              >
                {isPaying && <CircularProgress size={26} className={styles.spinner} />}
                {!isPaying && 'Place Order'}
              </Button>
            </div>
          </Grid>
        </Grid>
      </form>
    </BaseLayout>
  );
}

export default function CheckoutPage() {
  return (
    <StripeElementsWrapper type="main">
      <CheckoutPageMain />
    </StripeElementsWrapper>
  );
}
