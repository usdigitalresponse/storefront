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
  ILocationPreference,
  IOrderItem,
  IPickupLocation,
  IPrescreenFormData,
  InventoryRecord,
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
  SetItems,
  SetLocationsDialogIsOpen,
  SetOrderType,
  SetSelectedLocation,
  itemsSelector,
  locationPreferencesSelector,
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
import LocationPreferences from '../components/LocationPreferences';
import OptInView from '../components/OptInView';
import OrderSummary from '../components/OrderSummary';
import OrderTypeSelector from '../components/OrderTypeSelector';
import OrderTypeView from '../components/OrderTypeView';
import PhoneField from '../components/PhoneField';
import PrescreenQuestions from '../components/PrescreenQuestions';

import Questions from '../components/Questions';
import React, { useEffect, useState } from 'react';
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
  const orderType = useSelector<IAppState, OrderType>((state) => state.cart.orderType);
  const isSmall = useIsSmall();
  const hasErrors = Object.keys(errors).length > 0;
  const items = useSelector<IAppState, IOrderItem[]>(itemsSelector);
  const paymentStatus = useSelector<IAppState, PaymentStatus>(paymentStatusSelector);
  const paymentError = useSelector<IAppState, string | undefined>((state) => state.checkout.error);
  const isPaying = paymentStatus === PaymentStatus.IN_PROGRESS;
  const requiresEligibility = !!useContent('checkout_donation_confirm_eligibility');

  const allQuestions = useSelector<IAppState, Question[]>(questionsSelector);
  const questions: Question[] = [];

  const prescreenOrders = useSelector((state: IAppState) => state.cms.config.prescreenOrders);

  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const isDonationRequest = useSelector<IAppState, boolean>((state) => state.checkout.isDonationRequest);
  const requiresPayment = useSelector<IAppState, boolean>(requiresPaymentSelector);
  const payState = useSelector<IAppState, PayState>((state) => state.checkout.payState);
  const orderAmount = useSelector<IAppState, number>(subtotalWithDiscountSelector);
  const inventory = useSelector<IAppState, InventoryRecord[]>((state) => state.cms.inventory);

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
  const prescreenTitle = useContent('prescreen_questionaire_title');
  const prescreenDescription = useContent('prescreen_questionaire_subtitle');

  let selectedLocation = useSelector<IAppState, IPickupLocation | undefined>(selectedLocationSelector);
  const {
    defaultState,
    deliveryPreferences,
    deliveryEnabled,
    deliveryOptionsOnCheckout,
    payUponDeliveryEnabled,
    payUponPickupEnabled,
    tippingEnabled,
    ordersEnabled,
  } = config;
  const showPaymentOptions =
    (orderType === OrderType.PICKUP && payUponPickupEnabled) ||
    (orderType === OrderType.DELIVERY && payUponDeliveryEnabled);
  const locationPreferences = useSelector<IAppState, ILocationPreference>(locationPreferencesSelector);

  let locationLocked = false;
  let query = qs.parse(window.location.search.substring(1));
  console.log('query', query);

  if (query.communitysite) {
    locationLocked = true;
    let id = query.communitysite?.toString();
    console.log('dispatching SetSelectedLocation', id);
    dispatch(SetSelectedLocation.create(id));
  }

  let [finishedPrescreen, setFinishedPrescreen] = useState(query.screened === 'true');
  let [cartConverted, setCartConverted] = useState(false);
  let [pushQuestions, setPushQuestions] = useState<IPrescreenFormData>();

  useEffect(() => {
    if (finishedPrescreen && !query.screened) {
      query.screened = 'true';
      history.push(reverse('checkout', query));
    }
  }, [finishedPrescreen]);

  console.log('prescreenOrders', prescreenOrders);

  let communitySite: string | undefined = undefined;
  let dacl = false;
  let deliveryOnly = false;
  if (prescreenOrders) {
    let query = qs.parse(window.location.search.substring(1));
    console.log('query', query);
    communitySite = query.communitysite?.toString();
    dacl = query.dacl !== undefined;
    deliveryOnly = query.deliveryOnly !== undefined;

    console.log('communitySite, dacl, deliveryOnly, orderType', communitySite, dacl, deliveryOnly, orderType);

    if (deliveryOnly) {
      dispatch(SetOrderType.create(OrderType.DELIVERY));
    }
    console.log('after force delivery orderType', orderType);
  }

  let [communitySitePassed, setCommunitySitePassed] = useState(communitySite ? true : false);

  let preOrderMode = window.location.search.toLowerCase().indexOf('preorder') > -1;

  if (prescreenOrders) {
    allQuestions.forEach((question) => {
      console.log('finishedPrescreen, preScreen, question', finishedPrescreen, question.preScreen, question);
      if (question.preScreen !== finishedPrescreen) {
        if (dacl && deliveryOnly && question.daclDelivery) {
          console.log('dacl delivery', question);
          questions.push(question);
          return;
        }

        if (dacl && !deliveryOnly && question.daclPickup) {
          console.log('dacl pickup', question);
          questions.push(question);
          return;
        }

        if (communitySite && !deliveryOnly && question.communitySite) {
          console.log('community site', question);
          questions.push(question);
          return;
        }

        if (!dacl && !deliveryOnly && !communitySite) {
          if (question.webEnrollment) {
            console.log('web enrollment', question);
            questions.push(question);
            return;
          }
        }
      }
    });
  } else {
    console.log('not prescreen');
    questions.push(...allQuestions);
  }

  const selectedLocationId = selectedLocation?.id;

  useEffect(() => {
    const isWaitlist = !!qs.parse(location.search.slice(1))?.waitlist;
    if (isWaitlist) {
      dispatch(SetIsDonationRequest.create(true));
    }
  }, [dispatch, location.search]);

  useEffect(() => {
    console.log('selectedLocationID effect', selectedLocationId);
    if (selectedLocationId) {
      clearError('pickupLocationId');
    }
  }, [clearError, selectedLocationId]);

  async function onSubmit(data: ICheckoutFormData) {
    dispatch(CompoundAction([SetIsPaying.create(true), SetError.create(undefined)]));

    console.log('onSubmit items', items, data);
    console.log('before push data', JSON.stringify(data));
    if (pushQuestions) {
      Object.assign(data, pushQuestions);
    }
    console.log('before pay data', JSON.stringify(data));
    console.log('before pay items', JSON.stringify(items));

    const status = await StripeService.pay(data, stripe, elements, locationPreferences);

    console.log('done pay items', items, data);

    if (status === PaymentStatus.SUCCEEDED) {
      history.push(reverse('confirmation', query));
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

  console.log('selectedLocation', selectedLocation, selectedLocationId, query.communitysite, orderType);

  if (prescreenOrders) {
    console.log('cartConverted', cartConverted, dacl);

    if (!selectedLocation && query.communitysite) {
      return (
        <>
          <BaseLayout title={prescreenTitle} description={prescreenDescription}>
            <h3>Error with Application Link</h3>
            The link you tried to use has an error in it. Please contact DC Greens.
          </BaseLayout>
        </>
      );
    }

    if (finishedPrescreen === false) {
      return (
        <>
          <BaseLayout title={prescreenTitle} description={prescreenDescription}>
            <PrescreenQuestions
              communitySite={communitySite}
              dacl={dacl}
              deliveryOnly={deliveryOnly}
              orderType={orderType}
              selectedLocation={selectedLocation}
              questions={questions}
              setPushQuestions={setPushQuestions}
              setFinishedPrescreen={setFinishedPrescreen}
            />
          </BaseLayout>
        </>
      );
    } else {
      if (cartConverted === false && communitySitePassed) {
        console.log('inventory', inventory);
        let convertItem: string | null = null;
        inventory.some((item) => {
          console.log('item', item.stockLocation, communitySite, item.name, item);
          if (item.stockLocation === communitySite) {
            console.log('dacl item?', dacl, item.name.toLowerCase().indexOf('dacl'));
            if (dacl && item.name.toLowerCase().indexOf('dacl') > -1) {
              convertItem = item.id;
              console.log('converting to dacl item', convertItem);
            }
            if (!dacl && item.name.toLowerCase().indexOf('dacl') === -1) {
              convertItem = item.id;
              console.log('converting to non-dacl item', convertItem);
            }
            if (convertItem) {
              console.log('converting Cart', convertItem);
              dispatch(
                CompoundAction([
                  SetItems.create([{ id: convertItem, quantity: 1 }]),
                  SetIsDonationRequest.create(true),
                ]),
              );
              setCartConverted(true);
              return true;
            }
          }
        });
      }

      if (cartConverted) {
        console.log('post conversion items', items);
      }
    }
  }

  console.log('enabled?', ordersEnabled, preOrderMode);
  if (!ordersEnabled && !preOrderMode) {
    return <Redirect to="/" />;
  } else {
    console.log('skip redirect');
  }

  console.log('errors', errors);

  return (
    <BaseLayout>
      <form onSubmit={handleSubmit(onSubmit)} className={classNames(styles.container, { [styles.small]: isSmall })}>
        <Grid container spacing={2}>
          {locationLocked && (
            <Grid item md={8} xs={12}>
              <Typography variant="h3" className={styles.title}>
                <Content id="checkout_pickup_location_header" defaultText="Pickup Location" />
              </Typography>
              {selectedLocation && <Location location={selectedLocation} className={styles.selectedLocation} />}
              <Input
                type="hidden"
                name="pickupLocationId"
                value={selectedLocationId || ''}
                inputRef={register({ required: orderType === OrderType.PICKUP })}
              />
            </Grid>
          )}

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
                    <Questions
                      register={register}
                      errors={errors}
                      questionClassName={styles.field}
                      questions={questions}
                    />
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
              {!locationLocked && orderType === OrderType.PICKUP && (
                <Grid container className={styles.section}>
                  <Typography variant="h3" className={styles.title}>
                    <Content id="checkout_pickup_location_header" defaultText="Pickup Location" />
                  </Typography>
                  <Grid item md={8} xs={12}>
                    {selectedLocation && <Location location={selectedLocation} className={styles.selectedLocation} />}
                    <LocationPreferences locationPrefs={locationPreferences} />

                    <Button
                      className={classNames(styles.locationButton, { [styles.error]: !!errors.pickupLocationId })}
                      color="primary"
                      onClick={() => dispatch(SetLocationsDialogIsOpen.create(true))}
                    >
                      {selectedLocation || locationPreferences.location1
                        ? contentLocationOptionChange || 'Change'
                        : contentLocationOptionChoose || 'Choose'}{' '}
                      location...
                    </Button>
                    <Input
                      type="hidden"
                      name="pickupLocationId"
                      value={selectedLocationId || ''}
                      inputRef={register({ required: !config.lotteryEnabled && orderType === OrderType.PICKUP })}
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

  let preOrderMode = window.location.search.toLowerCase().indexOf('preorder') > -1;

  if (!ordersEnabled && !preOrderMode) {
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
