import {
  Button,
  ButtonGroup,
  Card,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  TextFieldProps,
  Typography,
} from '@material-ui/core';
import { DonationFormField, IDonationFormData, PaymentStatus } from '../common/types';
import { IAppState } from '../store/app';
import { SetDonationAmount, paymentStatusSelector } from '../store/checkout';
import { StripeService } from '../services/StripeService';
import { reverse } from '../common/router';
import { useDispatch, useSelector } from 'react-redux';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import BaseLayout from '../layouts/BaseLayout';
import OrderSummary from '../components/OrderSummary';
import PhoneField from '../components/PhoneField';
import React, { useEffect } from 'react';
import StripeCardField from '../components/StripeCardField';
import StripeElementsWrapper from '../components/StripeElementsWrapper';
import classNames from 'classnames';
import styles from './DonatePage.module.scss';
import theme from '../common/theme';

const DonatePageMain: React.FC = () => {
  const { register, handleSubmit, watch, setValue, errors } = useForm<IDonationFormData>();
  const isSmall = useIsSmall();
  const hasErrors = Object.keys(errors).length > 0;
  const stripe = useStripe();
  const elements = useElements();
  const paymentStatus = useSelector<IAppState, PaymentStatus>(paymentStatusSelector);
  const paymentError = useSelector<IAppState, string | undefined>((state) => state.checkout.error);
  const isPaying = paymentStatus === PaymentStatus.IN_PROGRESS;
  const donationAmount = useSelector<IAppState, number>((state) => state.checkout.donationAmount);
  const donationPresets = useSelector<IAppState, number[]>((state) => state.cms.donationPresets);
  const history = useHistory();
  const dispatch = useDispatch();
  const otherAmount = watch('otherAmount');

  useEffect(() => {
    if (paymentStatus === PaymentStatus.SUCCEEDED) {
      history.push(reverse('confirmation'));
    }
  }, [paymentStatus, history]);

  function onSubmit(data: IDonationFormData) {
    StripeService.donate(data, stripe, elements);
  }

  function textFieldProps(label: string, name: DonationFormField, placeholder?: string): TextFieldProps {
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

  function updateAmount(amount: number) {
    setValue('otherAmount', '');
    dispatch(SetDonationAmount.create(amount));
  }

  return (
    <BaseLayout
      title="Donate"
      description="Donate to community members who could use some help getting convenient access to the nutrition they need."
    >
      <form onSubmit={handleSubmit(onSubmit)} className={classNames(styles.container, { [styles.small]: isSmall })}>
        <Grid container spacing={2}>
          <Grid item md={8} xs={12}>
            <Card elevation={2} className={styles.form}>
              <Grid container className={styles.section}>
                <Typography variant="h3" className={styles.title}>
                  Amount
                </Typography>
                <Grid item md={8} xs={12} className={styles.amounts}>
                  <ButtonGroup fullWidth={isSmall}>
                    {donationPresets.map((amount: number, index: number) => {
                      const isSelected = amount === donationAmount && !otherAmount;
                      return (
                        <Button
                          key={`${amount}-${index}`}
                          className={styles.amountButton}
                          variant="outlined"
                          size="large"
                          color="primary"
                          style={{
                            backgroundColor: isSelected ? theme.palette.primary.main : undefined,
                            color: isSelected ? 'white' : undefined,
                          }}
                          onClick={() => updateAmount(amount)}
                        >
                          ${amount}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                  <TextField
                    fullWidth
                    className={styles.otherAmount}
                    variant="outlined"
                    label="Other Amount"
                    name="otherAmount"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputRef={register}
                  />
                </Grid>
              </Grid>
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
};

export default function DonatePage() {
  return (
    <StripeElementsWrapper type="donation">
      <DonatePageMain />
    </StripeElementsWrapper>
  );
}
