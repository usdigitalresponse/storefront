import {
  Button,
  Card,
  CircularProgress,
  FormHelperText,
  Grid,
  Input,
  Link,
  TextField,
  TextFieldProps,
  Typography,
} from '@material-ui/core';
import {
  CheckoutFormField,
  ICheckoutFormData,
  IOrderItem,
  IPickupLocation,
  OrderType,
  PaymentStatus,
} from '../common/types';
import { IAppState } from '../store/app';
import { SetIsDonationRequest, paymentStatusSelector } from '../store/checkout';
import { SetLocationsDialogIsOpen, selectedLocationSelector } from '../store/cart';
import { StripeService } from '../services/StripeService';
import { reverse } from '../common/router';
import { useDispatch, useSelector } from 'react-redux';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import AddressView from '../components/AddressView';
import BaseLayout from '../layouts/BaseLayout';
import Content from '../components/Content';
import DeliveryPreferences from '../components/DeliveryPreferences';
import OptInView from '../components/OptInView';
import OrderSummary from '../components/OrderSummary';
import OrderTypeView from '../components/OrderTypeView';
import PhoneField from '../components/PhoneField';
import React, { useEffect } from 'react';
import StateField from '../components/StateField';
import StripeCardField from '../components/StripeCardField';
import StripeElementsWrapper from '../components/StripeElementsWrapper';
import ZipCodeField from '../components/ZipCodeField';
import classNames from 'classnames';
import styles from './CheckoutPage.module.scss';

function CheckoutPageMain() {
  const { register, setValue, watch, handleSubmit, errors, clearError } = useForm<ICheckoutFormData>();
  const orderType = useSelector<IAppState, OrderType>((state) => state.cart.orderType);
  const defaultState = useSelector<IAppState, string | undefined>((state) => state.cms.defaultState);
  const isSmall = useIsSmall();
  const hasErrors = Object.keys(errors).length > 0;
  const stripe = useStripe();
  const elements = useElements();
  const items = useSelector<IAppState, IOrderItem[]>((state) => state.cart.items);
  const paymentStatus = useSelector<IAppState, PaymentStatus>(paymentStatusSelector);
  const paymentError = useSelector<IAppState, string | undefined>((state) => state.checkout.error);
  const isPaying = paymentStatus === PaymentStatus.IN_PROGRESS;
  const selectedLocation = useSelector<IAppState, IPickupLocation | undefined>(selectedLocationSelector);
  const selectedLocationId = useSelector<IAppState, string | undefined>((state) => state.cart.selectedLocation);
  const history = useHistory();
  const dispatch = useDispatch();
  const isDonationRequest = useSelector<IAppState, boolean>((state) => state.checkout.isDonationRequest);

  useEffect(() => {
    if (selectedLocationId) {
      clearError('pickupLocationId');
    }
  }, [clearError, selectedLocationId]);

  async function onSubmit(data: ICheckoutFormData) {
    const status = await StripeService.pay(data, stripe, elements);

    if (status === PaymentStatus.SUCCEEDED) {
      history.push(reverse('confirmation'));
    }
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
            <OrderTypeView />
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
                  {!isDonationRequest && <OptInView className={styles.optIn} />}
                </Grid>
              </Grid>
              {orderType === OrderType.PICKUP && (
                <Grid container className={styles.section}>
                  <Typography variant="h3" className={styles.title}>
                    Pickup Location
                  </Typography>
                  <Grid item md={8} xs={12}>
                    {selectedLocation && (
                      <div className={styles.selectedLocation}>
                        <Typography variant="body1" className={styles.locationName}>
                          {selectedLocation.name}
                        </Typography>
                        <AddressView
                          address={selectedLocation.address}
                          variant="body2"
                          textClassName={styles.locationAddress}
                        />
                      </div>
                    )}
                    <Button
                      className={classNames(styles.locationButton, { [styles.error]: !!errors.pickupLocationId })}
                      color="primary"
                      onClick={() => dispatch(SetLocationsDialogIsOpen.create(true))}
                    >
                      {selectedLocation ? 'Change' : 'Choose'} location...
                    </Button>
                    <Input
                      type="hidden"
                      name="pickupLocationId"
                      value={selectedLocationId || ''}
                      inputRef={register({ required: orderType === OrderType.PICKUP })}
                    />
                    {errors.pickupLocationId && <FormHelperText error>Please select a pickup location</FormHelperText>}
                  </Grid>
                </Grid>
              )}
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
                {!isDonationRequest && (
                  <Grid item md={8} xs={12}>
                    <StripeCardField errorMessage={paymentError} />
                  </Grid>
                )}
                {isDonationRequest && (
                  <Grid item md={8} xs={12}>
                    <Typography variant="body1" className={styles.payMessage}>
                      <Content id="checkout_waitlist_copy" />
                    </Typography>
                    <Typography variant="body1" className={styles.payMessage}>
                      <Link onClick={() => dispatch(SetIsDonationRequest.create(false))} className={styles.payLink}>
                        Click here
                      </Link>{' '}
                      if you'd rather pay for these items yourself.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Grid>
          <Grid item md={4} xs={12} container className={styles.right}>
            <div className={!isSmall ? styles.sidebar : undefined}>
              <OrderSummary className={styles.summary} showLineItems editable={!isDonationRequest} />
              <Button
                className={classNames({ [styles.readOnly]: isPaying })}
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={hasErrors || !items.length}
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
