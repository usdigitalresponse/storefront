import {
  Button,
  Card,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Grid,
  Input,
  Link,
  Radio,
  RadioGroup,
  TextField,
  TextFieldProps,
  Typography,
} from '@material-ui/core';
import {
  CheckoutFormField,
  ICheckoutFormData,
  IConfig,
  IOrderItem,
  IPickupLocation,
  OrderType,
  PayState,
  PaymentStatus,
  Question,
} from '../common/types';
import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import {
  SetError,
  SetIsDonationRequest,
  SetIsPaying,
  SetPayState,
  paymentStatusSelector,
  requiresPaymentSelector,
} from '../store/checkout';
import {
  SetLocationsDialogIsOpen,
  itemsSelector,
  selectedLocationSelector,
  subtotalWithDiscountSelector,
} from '../store/cart';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import { StripeService } from '../services/StripeService';
import { questionsSelector, useContent } from '../store/cms';
import { reverse } from '../common/router';
import { useDispatch, useSelector } from 'react-redux';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { useIsSmall } from '../common/hooks';
import BaseLayout from '../layouts/BaseLayout';
import ConfirmEligibilityView from '../components/ConfirmEligibilityView';
import Content from '../components/Content';
import DeliveryPreferences from '../components/DeliveryPreferences';
import Location from '../components/Location';
import OptInView from '../components/OptInView';
import OrderSummary from '../components/OrderSummary';
import OrderTypeSelector from '../components/OrderTypeSelector';
import OrderTypeView from '../components/OrderTypeView';
import PhoneField from '../components/PhoneField';
import Questions from '../components/Questions';
import React, { useEffect } from 'react';
import StateField from '../components/StateField';
import StripeCardField from '../components/StripeCardField';
import StripeElementsWrapper from '../components/StripeElementsWrapper';
import TipField from '../components/TipField';
import WaitlistDialog from '../components/WaitlistDialog';
import ZipCodeField from '../components/ZipCodeField';
import classNames from 'classnames';
import qs from 'qs';
import styles from './CheckoutPage.module.scss';

interface Props {
  stripe?: Stripe | null;
  elements?: StripeElements | null;
}

const CheckoutPageMain: React.FC<Props> = ({ stripe = null, elements = null }) => {
  const { register, watch, handleSubmit, errors, clearError } = useForm<ICheckoutFormData>();
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  const {
    defaultState,
    deliveryPreferences,
    deliveryEnabled,
    deliveryOptionsOnCheckout,
    payUponDeliveryEnabled,
    payUponPickupEnabled,
    tippingEnabled,
  } = config;
  const orderType = useSelector<IAppState, OrderType>((state) => state.cart.orderType);
  const isSmall = useIsSmall();
  const hasErrors = Object.keys(errors).length > 0;
  const items = useSelector<IAppState, IOrderItem[]>(itemsSelector);
  const paymentStatus = useSelector<IAppState, PaymentStatus>(paymentStatusSelector);
  const paymentError = useSelector<IAppState, string | undefined>((state) => state.checkout.error);
  const isPaying = paymentStatus === PaymentStatus.IN_PROGRESS;
  const requiresEligibility = !!useContent('checkout_donation_confirm_eligibility');
  const selectedLocation = useSelector<IAppState, IPickupLocation | undefined>(selectedLocationSelector);
  const allQuestions = useSelector<IAppState, Question[]>(questionsSelector);
  const questions: Question[] = []
  allQuestions.forEach((question) => {
    if (question.preScreen !== true) {
      questions.push(question)
    }
  })
  const selectedLocationId = selectedLocation?.id;
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const isDonationRequest = useSelector<IAppState, boolean>((state) => state.checkout.isDonationRequest);
  const requiresPayment = useSelector<IAppState, boolean>(requiresPaymentSelector);
  const payState = useSelector<IAppState, PayState>((state) => state.checkout.payState);
  const orderAmount = useSelector<IAppState, number>(subtotalWithDiscountSelector);

  // Content
  const contentPayNowOptionLabel = useContent('pay_now_option_label');
  const contentPayLaterOptionLabel = useContent('pay_later_option_label');
  const contentFieldIsRequired = useContent('checkout_field_is_required');
  const contentFieldName = useContent('checkout_field_name');
  const contentFieldNameFirstLast = useContent('checkout_field_name_first_last');
  const contentFieldNameFirstLastRequired = useContent('checkout_field_name_first_last_required');
  const contentFieldPhoneNumber = useContent('checkout_field_phone_number');
  const contentFieldEmail = useContent('checkout_field_email');
  const contentFieldAddressStreet1 = useContent('checkout_field_address_street_1');
  const contentFieldAddressStreet2 = useContent('checkout_field_address_street_2');
  const contentFieldAddressCity = useContent('checkout_field_address_city');
  const contentFieldAddressState = useContent('checkout_field_address_state');
  const contentFieldAddressZipcode = useContent('checkout_field_address_zipcode');
  const contentLocationOptionChange = useContent('checkout_location_option_change');
  const contentLocationOptionChoose = useContent('checkout_location_option_choose');

  const showPaymentOptions =
    (orderType === OrderType.PICKUP && payUponPickupEnabled) ||
    (orderType === OrderType.DELIVERY && payUponDeliveryEnabled);

  useEffect(() => {
    const isWaitlist = !!qs.parse(location.search.slice(1))?.waitlist;
    if (isWaitlist) {
      dispatch(SetIsDonationRequest.create(true));
    }
  }, [dispatch, location.search]);

  useEffect(() => {
    if (selectedLocationId) {
      clearError('pickupLocationId');
    }
  }, [clearError, selectedLocationId]);

  async function onSubmit(data: ICheckoutFormData) {
    dispatch(CompoundAction([SetIsPaying.create(true), SetError.create(undefined)]));

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

  const disableSubmit = hasErrors || !items.length;

  return (
    <BaseLayout>
      <form onSubmit={handleSubmit(onSubmit)} className={classNames(styles.container, { [styles.small]: isSmall })}>
        <Grid container spacing={2}>
          <Grid item md={8} xs={12}>
            {deliveryOptionsOnCheckout && <OrderTypeSelector className={styles.orderType} />}
            {!deliveryOptionsOnCheckout && deliveryEnabled && <OrderTypeView className={styles.orderType} />}
            <Card elevation={2} className={styles.form}>
              <Grid container className={styles.section}>
                <Typography variant="h3" className={styles.title}>
                  <Content id="checkout_personal_info_header" defaultText="Personal Information" />
                </Typography>
                <Grid item md={8} xs={12}>
                  <TextField
                    {...textFieldProps(
                      contentFieldName || 'Name',
                      'fullName',
                      contentFieldNameFirstLast || 'First Last',
                    )}
                    inputRef={register({
                      required: contentFieldIsRequired || 'Name is required',
                      pattern: {
                        value: /[\w-']+ [\w-'][\w-']+/,
                        message: contentFieldNameFirstLastRequired || 'First and Last name required',
                      },
                    })}
                    autoCorrect="off"
                  />
                  <TextField
                    {...textFieldProps(contentFieldPhoneNumber || 'Phone Number', 'phone')}
                    type="tel"
                    inputRef={register({ required: contentFieldIsRequired || 'Phone Number is required' })}
                    InputProps={{ inputComponent: PhoneField }}
                  />
                  <TextField
                    {...textFieldProps(contentFieldEmail || 'Email', 'email', 'name@domain.com')}
                    type="email"
                    inputRef={register({ required: contentFieldIsRequired || 'Email is required' })}
                  />
                  {questions.length !== 0 && (
                    <Questions register={register} errors={errors} questionClassName={styles.field} questions={questions} />
                  )}
                  {!isDonationRequest && <OptInView className={styles.optIn} inputRef={register} />}
                  {isDonationRequest && (
                    <ConfirmEligibilityView
                      className={styles.optIn}
                      inputRef={register({ required: requiresEligibility ? 'Eligiblity required' : false })}
                      errors={errors}
                    />
                  )}
                </Grid>
              </Grid>
              {orderType === OrderType.PICKUP && (
                <Grid container className={styles.section}>
                  <Typography variant="h3" className={styles.title}>
                    <Content id="checkout_pickup_location_header" defaultText="Pickup Location" />
                  </Typography>
                  <Grid item md={8} xs={12}>
                    {selectedLocation && <Location location={selectedLocation} className={styles.selectedLocation} />}
                    <Button
                      className={classNames(styles.locationButton, { [styles.error]: !!errors.pickupLocationId })}
                      color="primary"
                      onClick={() => dispatch(SetLocationsDialogIsOpen.create(true))}
                    >
                      {selectedLocation
                        ? contentLocationOptionChange || 'Change'
                        : contentLocationOptionChoose || 'Choose'}{' '}
                      location...
                    </Button>
                    <Input
                      type="hidden"
                      name="pickupLocationId"
                      value={selectedLocationId || ''}
                      inputRef={register({ required: orderType === OrderType.PICKUP })}
                    />
                    {errors.pickupLocationId && (
                      <FormHelperText error>
                        <Content id="checkout_error_location_missing" defaultText="Please select a pickup location" />
                      </FormHelperText>
                    )}
                  </Grid>
                </Grid>
              )}
              {orderType === OrderType.DELIVERY && (
                <>
                  {deliveryPreferences && (
                    <Grid container className={styles.section}>
                      <Typography variant="h3" className={styles.title}>
                        <Content id="checkout_delivery_preferences_header" defaultText="Delivery Preferences" />
                      </Typography>
                      <Grid item md={8} xs={12}>
                        <DeliveryPreferences inputRef={register} watch={watch} />
                      </Grid>
                    </Grid>
                  )}
                  <Grid container className={styles.section}>
                    <Typography variant="h3" className={styles.title}>
                      <Content id="checkout_delivery_address_header" defaultText="Delivery Address" />
                    </Typography>
                    <Grid item md={8} xs={12}>
                      <TextField
                        {...textFieldProps(contentFieldAddressStreet1 || 'Street 1', 'street1', '123 Main St.')}
                        inputRef={register({ required: contentFieldIsRequired || 'Street 1 is required' })}
                      />
                      <TextField
                        {...textFieldProps(
                          contentFieldAddressStreet2 || 'Street 2',
                          'street2',
                          'Apt 4B, Floor 2, etc.',
                        )}
                        inputRef={register}
                      />
                      <TextField
                        {...textFieldProps(contentFieldAddressCity || 'City', 'city', 'San Antonio')}
                        inputRef={register({ required: contentFieldIsRequired || 'City is required' })}
                      />
                      <StateField
                        {...textFieldProps(contentFieldAddressState || 'State', 'state', 'CA')}
                        value={defaultState}
                        inputProps={{ readOnly: !!defaultState }}
                        inputRef={register({ required: contentFieldIsRequired || 'State is required', maxLength: 2 })}
                      />
                      <ZipCodeField
                        {...textFieldProps(contentFieldAddressZipcode || 'Zip Code', 'zip')}
                        inputRef={register({
                          required: contentFieldIsRequired || 'Zip code is required',
                          maxLength: 5,
                        })}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
              {tippingEnabled &&
                !isDonationRequest &&
                (requiresPayment || (payState === PayState.LATER && showPaymentOptions) || orderAmount > 0) && (
                  <Grid container className={styles.section}>
                    <Typography variant="h3" className={styles.title}>
                      <Content id="tip_label" defaultText="Tip" />
                    </Typography>
                    <Grid item md={8} xs={12}>
                      <TipField />
                    </Grid>
                  </Grid>
                )}
              {(requiresPayment || (payState === PayState.LATER && showPaymentOptions)) && (
                <Grid container className={styles.section}>
                  <Typography variant="h3" className={classNames(styles.title, styles.payment)}>
                    <Content id="checkout_payment_details_header" defaultText="Payment Details" />
                  </Typography>
                  {showPaymentOptions && (
                    <RadioGroup
                      row
                      value={payState}
                      onChange={(e) => dispatch(SetPayState.create(e.target.value as PayState))}
                      className={styles.payState}
                    >
                      <FormControlLabel
                        value={PayState.NOW}
                        control={<Radio color="primary" />}
                        label={contentPayNowOptionLabel || 'Pay now'}
                      />
                      <FormControlLabel
                        value={PayState.LATER}
                        control={<Radio color="primary" />}
                        label={contentPayLaterOptionLabel || 'Pay later'}
                      />
                    </RadioGroup>
                  )}
                  {requiresPayment && (
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
                        <Link
                          onClick={() => {
                            dispatch(SetIsDonationRequest.create(false));
                            history.push(reverse('checkout'));
                          }}
                          className={styles.payLink}
                        >
                          <Content id="donation_request_click_here" defaultText="Click here" />
                        </Link>{' '}
                        <Content
                          id="donation_request_rather_pay_yourself"
                          defaultText="if you'd rather pay for these items yourself."
                        />
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </Card>
          </Grid>
          <Grid item md={4} xs={12} container className={styles.right}>
            <div className={!isSmall ? styles.sidebar : undefined}>
              <OrderSummary className={styles.summary} showLineItems editable={!isDonationRequest} showTip />
              <Button
                className={classNames({ [styles.readOnly]: isPaying })}
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={disableSubmit}
              >
                {isPaying && <CircularProgress size={26} className={styles.spinner} />}
                {!isPaying && <Content id="checkout_submit_button_label" defaultText="Place Order" />}
              </Button>
              {(hasErrors || !!paymentError) && (
                <Typography className={styles.errorMessage} color="error">
                  {paymentError || (
                    <Content id="checkout_error_please_fix" defaultText="Please fix the errors in your form" />
                  )}
                </Typography>
              )}
              {items.length === 0 && (
                <Typography className={styles.errorMessage}>
                  <Content id="checkout_error_cart_empty" defaultText="Your cart is empty" />
                </Typography>
              )}
            </div>
          </Grid>
        </Grid>
        <WaitlistDialog onSubmit={handleSubmit(onSubmit)} />
      </form>
    </BaseLayout>
  );
};

// TODO: useStripe and useElement must be called in an Elements component, and
// the Elements component doesn't work without a valid stripe promise...this was my
// workaround but I imagine there's a better way to do this
const CheckoutPageWithStripe = () => {
  const stripe = useStripe();
  const elements = useElements();

  return <CheckoutPageMain stripe={stripe} elements={elements} />;
};

export default function CheckoutPage() {
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  const { ordersEnabled } = config;

  if (!ordersEnabled) {
    return <Redirect to="/" />;
  }

  return config.stripeAPIKeyMain ? (
    <StripeElementsWrapper type="main">
      <CheckoutPageWithStripe />
    </StripeElementsWrapper>
  ) : (
    <CheckoutPageMain />
  );
}
