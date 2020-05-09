import { Card, Chip, Grid, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import {
  IDonationSummary,
  IOrderSummary,
  IPickupLocation,
  ISchedule,
  isDonationSummary,
  isOrderSummary,
} from '../common/types';
import { formatDate } from '../common/format';
import { pickupLocationsSelector } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import AddressView from '../components/AddressView';
import BaseLayout from '../layouts/BaseLayout';
import Content from '../components/Content';
import DonationSummary from '../components/DonationSummary';
import OrderSummary from '../components/OrderSummary';
import React from 'react';
import ScheduleView from '../components/ScheduleView';
import classNames from 'classnames';
import styles from './ConfirmationPage.module.scss';

interface Props {}

const ConfirmationPage: React.FC<Props> = () => {
  const confirmation = useSelector<IAppState, IOrderSummary | IDonationSummary>(
    (state) => state.checkout.confirmation!,
  );
  const isSmall = useIsSmall();
  const pickupLocations = useSelector<IAppState, IPickupLocation[] | undefined>(pickupLocationsSelector);
  const pickupLocation =
    isOrderSummary(confirmation) && confirmation.pickupLocationId && pickupLocations
      ? pickupLocations.find((location) => location.id === confirmation.pickupLocationId)
      : undefined;

  const type = isOrderSummary(confirmation) ? 'order' : 'donation';

  if (!confirmation) {
    return <BaseLayout title="Order not found" description={`Error finding order. Please try again`}></BaseLayout>;
  }
  return (
    <BaseLayout
      title={type === 'order' ? 'Order Placed!' : 'Thank you!'}
      description={
        <Typography variant="body1" className={styles.description}>
          We've sent an email confirmation to <span className={styles.em}>{confirmation.email}</span>.{' '}
          {isOrderSummary(confirmation) &&
            `You'll receive another email confirming the date and time of your ${confirmation.type.toLowerCase()} once your order is fulfilled.`}
          {isSmall ? (
            <>
              <br />
              <br />
            </>
          ) : (
            ' '
          )}
          If you have any questions, please email{' '}
          <span className={styles.em}>
            <Content id="contact_email" />
          </span>{' '}
          or call{' '}
          <span className={styles.em}>
            <Content id="contact_phone" />
          </span>
          .
        </Typography>
      }
    >
      <Grid
        container
        spacing={2}
        alignItems={isSmall ? undefined : 'stretch'}
        className={classNames(styles.container, { [styles.small]: isSmall })}
      >
        <Grid item md={8} xs={12} className={styles.column}>
          <Card elevation={2} className={classNames(styles.details, styles.card)}>
            <Typography variant="h3" className={styles.title}>
              Order Information
            </Typography>
            <Grid container spacing={2} className={styles.content}>
              <Grid item md={4} xs={12} className={styles.info}>
                <Typography variant="overline" className={styles.label}>
                  Details
                </Typography>
                <Typography variant="body1" className={styles.value}>
                  Order #<span className={styles.em}>{confirmation.id}</span>
                </Typography>
                <Typography variant="body1" className={styles.value}></Typography>
                <Typography variant="body1" className={styles.value}>
                  {formatDate(confirmation.createdAt)}
                </Typography>
              </Grid>
              <Grid item md={4} xs={12} className={styles.info}>
                <Typography variant="overline" className={styles.label}>
                  Contact Information
                </Typography>
                <Typography variant="body1" className={styles.value}>
                  {confirmation.fullName}
                </Typography>
                <Typography variant="body1" className={styles.value}>
                  {confirmation.phone}
                </Typography>
                <Typography variant="body1" className={styles.value}>
                  {confirmation.email}
                </Typography>
              </Grid>
              {isOrderSummary(confirmation) && confirmation.deliveryAddress && (
                <Grid item md={4} xs={12} className={styles.info}>
                  <Typography variant="overline" className={styles.label}>
                    Delivery Address
                  </Typography>
                  <AddressView address={confirmation.deliveryAddress} />
                  {confirmation.deliveryPreferences && (
                    <div className={styles.preferences}>
                      {confirmation.deliveryPreferences.map((pref) => (
                        <Chip key={pref} size="small" variant="outlined" label={pref} className={styles.preference} />
                      ))}
                    </div>
                  )}
                </Grid>
              )}
              {pickupLocation && (
                <Grid item md={4} xs={12} className={styles.info}>
                  <Typography variant="overline" className={styles.label}>
                    Pickup Location
                  </Typography>
                  <Typography variant="body1">{pickupLocation.name}</Typography>
                  <AddressView address={pickupLocation.address} />
                  <ScheduleView
                    variant="body1"
                    schedules={pickupLocation.schedules as ISchedule[]}
                    className={styles.schedules}
                  />
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>
        <Grid item md={4} xs={12} className={styles.column}>
          {isOrderSummary(confirmation) && (
            <OrderSummary showLineItems orderSummary={confirmation} className={styles.card} />
          )}
          {isDonationSummary(confirmation) && <DonationSummary amount={confirmation.total} className={styles.card} />}
        </Grid>
      </Grid>
    </BaseLayout>
  );
};

export default ConfirmationPage;
