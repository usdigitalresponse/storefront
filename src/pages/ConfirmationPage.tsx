import { Card, Grid, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { IDonationSummary, IOrderSummary, IPickupLocation, isDonationSummary, isOrderSummary } from '../common/types';
import { pickupLocationsSelector, useContent } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import AddressView from '../components/AddressView';
import BaseLayout from '../layouts/BaseLayout';
import DonationSummary from '../components/DonationSummary';
import OrderSummary from '../components/OrderSummary';
import React from 'react';
import classNames from 'classnames';
import styles from './ConfirmationPage.module.scss';

interface Props {}

const ConfirmationPage: React.FC<Props> = () => {
  const confirmation = useSelector<IAppState, IOrderSummary | IDonationSummary>(
    (state) => state.checkout.confirmation!,
  );
  const contact_phone = useContent('contact_phone');
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
      description={`We've sent an email confirmation to ${confirmation.email}. If you have any questions, we're here to help. Call ${contact_phone}`}
    >
      <Grid container className={classNames(styles.container, { [styles.small]: isSmall })}>
        <Grid item md={8} sm={12}>
          <Card elevation={2} className={styles.details}>
            <Typography variant="h3" className={styles.title}>
              Details
            </Typography>
            <div className={styles.content}>
              <div className={styles.info}>
                <Typography variant="body1" className={styles.label}>
                  Order Number
                </Typography>
                <Typography variant="body1" className={styles.value}>
                  {confirmation.id}
                </Typography>
              </div>
              <div className={styles.info}>
                <Typography variant="body1" className={styles.label}>
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
              </div>
              {isOrderSummary(confirmation) && confirmation.deliveryAddress && (
                <div className={styles.info}>
                  <Typography variant="body1" className={styles.label}>
                    Delivery Address
                  </Typography>
                  <AddressView address={confirmation.deliveryAddress} />
                </div>
              )}
              {pickupLocation && (
                <div className={styles.info}>
                  <Typography variant="body1" className={styles.label}>
                    Pickup Location
                  </Typography>
                  <Typography variant="body1">{pickupLocation.name}</Typography>
                  <AddressView address={pickupLocation.address} />
                </div>
              )}
            </div>
          </Card>
          {isOrderSummary(confirmation) && <OrderSummary orderSummary={confirmation} />}
          {isDonationSummary(confirmation) && <DonationSummary amount={confirmation.total} />}
        </Grid>
      </Grid>
    </BaseLayout>
  );
};

export default ConfirmationPage;
