import { Card, Chip, Grid, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import {
  IConfig,
  IDonationSummary,
  IOrderSummary,
  IPickupLocation,
  OrderStatus,
  OrderType,
  ZipcodeScheduleMap,
  isDonationSummary,
  isOrderSummary,
} from '../common/types';
import { formatDate } from '../common/format';
import { pickupLocationsSelector, useContent, zipcodeSchedulesSelector } from '../store/cms';
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
import qs from 'qs';
import styles from './ConfirmationPage.module.scss';

interface Props {}

const ConfirmationPage: React.FC<Props> = () => {
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  let query = qs.parse(window.location.search.substring(1));
  console.log('query', query);

  const confirmation = useSelector<IAppState, IOrderSummary | IDonationSummary>(
    (state) => state.checkout.confirmation!,
  );
  const isSmall = useIsSmall();
  const confirmationCopyOrder = useContent('confirmation_copy_order') || "No copy from CMS";
  const confirmationHeader = useContent('confirmation_header_all');
  const donationHeader = useContent('confirmation_header_donation');
  const pickupLocations = useSelector<IAppState, IPickupLocation[] | undefined>(pickupLocationsSelector);
  const zipcodeSchedules = useSelector<IAppState, ZipcodeScheduleMap>(zipcodeSchedulesSelector);
  const pickupLocation =
    isOrderSummary(confirmation) && confirmation.pickupLocationId && pickupLocations
      ? pickupLocations.find((location) => location.id === confirmation.pickupLocationId)
      : undefined;

  console.log(
    'pickup',
    isOrderSummary(confirmation),
    isOrderSummary(confirmation) ? confirmation.pickupLocationId : 'not order',
    isOrderSummary(confirmation) && confirmation.pickupLocationId && pickupLocations
      ? confirmation.pickupLocationId
      : 'no pickup location',
  );
  console.log('confirmation', confirmation);

  const copy = useContent('confirmation_copy_all');
  const donationCopy = useContent('confirmation_copy_donation');
  const copyEnrolled = useContent('confirmation_copy_enrolled');
  const confirmationWaitlistCopyAll = useContent('confirmation_waitlist_copy_all');

  const confirmationCopyAll =
    (!query.communitysite ? copy : copyEnrolled) || `We've sent an email confirmation to {customer-email}`;

  const type = isOrderSummary(confirmation) ? 'order' : 'donation';

  if (!confirmation) {
    return <BaseLayout title="Order not found" description={`Error finding order. Please try again`}></BaseLayout>;
  }

  let displayCopy = ((confirmation as IOrderSummary).status === OrderStatus.WAITLIST
    ? confirmationWaitlistCopyAll
    : confirmationCopyAll
  )

  if( type === "donation" ) {
    displayCopy = donationCopy || `We've sent an donation confirmation to {customer-email}`
  }

  displayCopy = displayCopy || "No copy from CMS"
    .replace(/\{customer-email\}/, `**${confirmation.email}**`)
    .replace(/\{pickupLocationName\}/, `**${pickupLocation ? pickupLocation?.name : 'your selected site'}**`)
    .concat(
      isOrderSummary(confirmation)
        ? ` ${confirmationCopyOrder.replace('{delivery|pickup}', confirmation.type.toLowerCase())}`
        : '',
    );

  //console.log('copy', copy);
  //console.log('copyEnrolled', copyEnrolled);
  //console.log('confirmationCopy', confirmationCopy);

  const title =
    type === 'order'
      ? (confirmation as IOrderSummary).status === OrderStatus.WAITLIST
        ? 'On the waitlist!'
        : !query.communitysite
        ? confirmationHeader || 'Order Placed!'
        : 'Enrollment Confirmed!'
      : donationHeader || 'Thank you for your donation!';

  return (
    <BaseLayout
      title={title}
      description={
        <>
          <Content text={displayCopy} markdown />
          <Typography variant="body1" className={styles.description}>
            {isSmall ? (
              <>
                <br />
                <br />
              </>
            ) : (
              ' '
            )}
            If you have any questions, please email <Content id="contact_email" /> or call{' '}
            <Content id="contact_phone" />.
          </Typography>
        </>
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
              {isDonationSummary(confirmation) && 'Donation Information'}
              {!isDonationSummary(confirmation) && 'Order Information'}
            </Typography>
            <Grid container spacing={2} className={styles.content}>
              <Grid item md={4} xs={12} className={styles.info}>
                <Typography variant="overline" className={styles.label}>
                  Details
                </Typography>
                <Typography variant="body1" className={styles.value}>
                  {isDonationSummary(confirmation) ? 'Donation' : 'Order'} #
                  <span className={styles.em}>{confirmation.id}</span>
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
              {isOrderSummary(confirmation) &&
                confirmation.type === OrderType.DELIVERY &&
                confirmation.deliveryAddress && (
                  <Grid item md={4} xs={12} className={styles.info}>
                    <Typography variant="overline" className={styles.label}>
                      Delivery Address
                    </Typography>
                    <AddressView address={confirmation.deliveryAddress} />
                    {zipcodeSchedules[confirmation.deliveryAddress?.zip] && (
                      <ScheduleView
                        variant="body2"
                        schedules={zipcodeSchedules[confirmation.deliveryAddress.zip]}
                        className={styles.schedules}
                      />
                    )}
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
                    schedules={pickupLocation.resolvedSchedules}
                    className={styles.schedules}
                  />
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>
        {!config.lotteryEnabled && (
          <Grid item md={4} xs={12} className={styles.column}>
            {isOrderSummary(confirmation) && (
              <OrderSummary showLineItems orderSummary={confirmation} className={styles.card} />
            )}
            {isDonationSummary(confirmation) && <DonationSummary amount={confirmation.total} className={styles.card} />}
          </Grid>
        )}
      </Grid>
    </BaseLayout>
  );
};

export default ConfirmationPage;
