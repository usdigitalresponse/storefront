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
  useTheme,
} from '@material-ui/core';
import { CompoundAction } from 'redoodle';
import { DonationFormField, IDonationFormData, PaymentStatus } from '../common/types';
import { IAppState } from '../store/app';
import { SetDonationAmount, SetError, SetIsPaying, makeDonationUnitCountSelector, paymentStatusSelector } from '../store/checkout';
import { StripeService } from '../services/StripeService';
import { formatCurrency } from '../common/format';
import { reverse } from '../common/router';
import { useContent } from '../store/cms';
import { useDispatch, useSelector } from 'react-redux';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import BaseLayout from '../layouts/BaseLayout';
import Content from '../components/Content';
import DonationSummary from '../components/DonationSummary';
import PhoneField from '../components/PhoneField';
import React, { useMemo } from 'react';
import StripeCardField from '../components/StripeCardField';
import StripeElementsWrapper from '../components/StripeElementsWrapper';
import classNames from 'classnames';
import pluralize from 'pluralize';
import styles from './DonatePage.module.scss';

const DonatePageMain: React.FC = () => {
  const { register, handleSubmit, watch, setValue, errors } = useForm<IDonationFormData>();
  const isSmall = useIsSmall();
  const theme = useTheme();
  const hasErrors = Object.keys(errors).length > 0;
  const stripe = useStripe();
  const elements = useElements();
  const paymentStatus = useSelector<IAppState, PaymentStatus>(paymentStatusSelector);
  const paymentError = useSelector<IAppState, string | undefined>((state) => state.checkout.error);
  const isPaying = paymentStatus === PaymentStatus.IN_PROGRESS;
  const donationAmount = useSelector<IAppState, number>((state) => state.checkout.donationAmount);
  const donationUnits = useSelector<IAppState, string | undefined>((state) => state.cms.config.donationUnits);
  const otherAmount = watch('otherAmount');
  const donationUnitCountSelector = useMemo(makeDonationUnitCountSelector, []);
  const donationUnitCount = useSelector((state: IAppState) => donationUnitCountSelector(state, otherAmount));
  const history = useHistory();
  const dispatch = useDispatch();
  const title = useContent('donate_page_title');
  const description = useContent('donate_page_subtitle');
  const donationPresets = [25, 50, 100, 250];

  async function onSubmit(data: IDonationFormData) {
    dispatch(CompoundAction([SetIsPaying.create(true), SetError.create(undefined)]));

    const status = await StripeService.donate(data, stripe, elements);

    if (status === PaymentStatus.SUCCEEDED) {
      history.push(reverse('confirmation'));
    }
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
    <BaseLayout title={title} description={description}>
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
                {donationUnits && (
                  <Typography variant="body1" className={styles.donationUnits}>
                    {formatCurrency(otherAmount ? parseInt(otherAmount) : donationAmount)} = ~
                    {pluralize(donationUnits, donationUnitCount, true)} for {donationUnitCount === 1 && 'a '}
                    {pluralize('family', donationUnitCount)} in need
                  </Typography>
                )}
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
              <DonationSummary
                className={styles.summary}
                amount={otherAmount ? parseInt(otherAmount) : donationAmount}
              />
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
                {!isPaying && <Content id='donate_page_submit_button' defaultText='Make Donation'/>}
              </Button>
            </div>
          </Grid>
        </Grid>
      </form>
    </BaseLayout>
  );
};

export default function DonatePage() {

  const testCard = window.location.search.toLowerCase().indexOf("testcard") > -1

  return (
    <StripeElementsWrapper type={testCard ? "test": "donation"}>
      <DonatePageMain />
    </StripeElementsWrapper>
  );
}
