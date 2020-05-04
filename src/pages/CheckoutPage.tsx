import {
  Button,
  Card,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  Select,
  TextField,
  TextFieldProps,
  Typography,
} from '@material-ui/core';
import { CheckoutFormField, ICheckoutFormData, OrderType } from '../common/types';
import { Elements } from '@stripe/react-stripe-js';
import { IAppState } from '../store/app';
import { getStripePromise } from '../store/cms';
import { useForm } from 'react-hook-form';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import OrderSummary from '../components/OrderSummary';
import OrderTypeView from '../components/OrderTypeView';
import PhoneField from '../components/PhoneField';
import React from 'react';
import StripeCardElement from '../components/StripeCardElement';
import classNames from 'classnames';
import styles from './CheckoutPage.module.scss';

export default function CheckoutPage() {
  const { register, handleSubmit, errors } = useForm<ICheckoutFormData>();
  const stripePromise = useSelector(getStripePromise());
  const orderType = useSelector<IAppState, OrderType>(state => state.cart.orderType);
  const defaultState = useSelector<IAppState, string>(state => state.cms.defaultState);
  const isSmall = useIsSmall();
  const hasErrors = Object.keys(errors).length > 0;

  function onSubmit(data: ICheckoutFormData) {
    console.log(errors);
    console.log(data);
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
      <Elements stripe={stripePromise}>
        <form onSubmit={handleSubmit(onSubmit)} className={classNames(styles.container, { [styles.small]: isSmall })}>
          <Grid container spacing={2}>
            <Grid item md={8} sm={12}>
              {orderType !== OrderType.DONATION && <OrderTypeView />}
              <Card elevation={2} className={styles.form}>
                <Grid container className={styles.section}>
                  <Typography variant="h3" className={styles.title}>
                    Personal Information
                  </Typography>
                  <Grid item md={8} sm={12}>
                    <TextField
                      {...textFieldProps('Name', 'fullName', 'First Last')}
                      inputRef={register({ required: 'Name is required' })}
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
                  <Grid container className={styles.section}>
                    <Typography variant="h3" className={styles.title}>
                      Delivery Address
                    </Typography>
                    <Grid item md={8} sm={12}>
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
                      <TextField
                        {...textFieldProps('State', 'state', 'CA')}
                        value={defaultState}
                        inputProps={{ readOnly: !!defaultState }}
                        inputRef={register({ required: 'City is required' })}
                      />
                      <FormControl variant="outlined" fullWidth error={!!errors.zip}>
                        <InputLabel>Zip Code</InputLabel>
                        <Select
                          native
                          label="Zip Code"
                          inputProps={{ name: 'zip' }}
                          inputRef={register({ required: 'Zip Code is required' })}
                          className={styles.field}
                        >
                          <option aria-label="None" value="" />
                          {['12345', '35566', '23425', '23423'].map(q => (
                            <option key={q} value={q}>
                              {q}
                            </option>
                          ))}
                        </Select>
                        {!!errors.zip?.message && <FormHelperText>{errors.zip.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                  </Grid>
                )}
                <Grid container className={styles.section}>
                  <Typography variant="h3" className={styles.title}>
                    Payment Details
                  </Typography>
                  <Grid item md={8} sm={12}>
                    <StripeCardElement className={styles.field} />
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={hasErrors}
                      type="submit"
                    >
                      Place Order
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item md={4} sm={12} container className={styles.right}>
              <div className={!isSmall ? styles.sidebar : undefined}>
                <OrderSummary className={styles.summary} />
                <Button fullWidth variant="contained" color="primary" size="large" disabled={hasErrors} type="submit">
                  Place Order
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
        {/* <CheckoutForm /> */}
      </Elements>
    </BaseLayout>
  );
}
