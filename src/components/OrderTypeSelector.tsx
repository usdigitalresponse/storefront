import { Button, Card, CardActionArea, CardActions, Grid, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { IPickupLocation, OrderType } from '../common/types';
import { SetLocationsDialogIsOpen, SetOrderType, selectedLocationSelector } from '../store/cart';
import { pickupLocationsSelector } from '../store/cms';
import { useDispatch, useSelector } from 'react-redux';
import { useIsSmall } from '../common/hooks';
import AddressView from './AddressView';
import CheckedIcon from '@material-ui/icons/CheckBox';
import Content from './Content';
import React from 'react';
import ScheduleView from './ScheduleView';
import UncheckedIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import classNames from 'classnames';
import styles from './OrderTypeSelector.module.scss';

interface Props {
  className?: string;
}

const OrderTypeSelector: React.FC<Props> = ({ className }) => {
  const isSmall = useIsSmall();
  const dispatch = useDispatch();
  const selectedLocation = useSelector<IAppState, IPickupLocation | undefined>(selectedLocationSelector);
  const pickupLocationCount = useSelector<IAppState, IPickupLocation[]>(pickupLocationsSelector).length;
  const orderType = useSelector<IAppState, OrderType>((state) => state.cart.orderType);
  const deliveryEnabled = useSelector<IAppState, boolean>((state) => state.cms.config.deliveryEnabled);

  return (
    <Grid container spacing={2} alignItems={isSmall ? undefined : 'stretch'} className={className}>
      {deliveryEnabled && (
        <Grid item md={6} xs={12} className={styles.column}>
          <Card elevation={2} className={classNames(styles.option, { [styles.small]: isSmall })}>
            <CardActionArea onClick={() => dispatch(SetOrderType.create(OrderType.DELIVERY))}>
              <div className={classNames(styles.content, styles.delivery)}>
                <div className={styles.check}>
                  {orderType === OrderType.DELIVERY ? (
                    <CheckedIcon color="primary" />
                  ) : (
                    <UncheckedIcon color="primary" />
                  )}
                </div>
                <div className={styles.label}>
                  <Typography variant="h4" className={styles.title}>
                    <Content id="delivery_option_title" defaultText="Delivery" />
                  </Typography>
                  <Typography variant="body1" className={styles.description}>
                    <Content id="delivery_option_subtitle" defaultText="Credit / Debit Card Only" />
                  </Typography>
                </div>
              </div>
            </CardActionArea>
          </Card>
        </Grid>
      )}
      <Grid item md={deliveryEnabled ? 6 : 12} xs={12}>
        <Card elevation={2} className={classNames(styles.option, { [styles.small]: isSmall })}>
          <CardActionArea onClick={() => dispatch(SetOrderType.create(OrderType.PICKUP))} disabled={!deliveryEnabled}>
            <div className={styles.content}>
              <div className={styles.check}>
                {orderType === OrderType.PICKUP ? <CheckedIcon color="primary" /> : <UncheckedIcon color="primary" />}
              </div>
              <div className={classNames(styles.label, { [styles.pickupLabel]: pickupLocationCount > 1 })}>
                <Typography variant="h4" className={styles.title}>
                  <Content id="pickup_option_title" defaultText="Pickup" />
                </Typography>
                <Typography variant="body1" className={styles.description}>
                  <Content id="pickup_option_subtitle" defaultText="Required for EBT or Cash" />
                </Typography>
                {selectedLocation && (
                  <div className={styles.selectedLocation}>
                    <Typography variant="body2" className={styles.locationName}>
                      {selectedLocation.name}
                    </Typography>
                    <AddressView
                      address={selectedLocation.address}
                      variant="body2"
                      textClassName={styles.locationAddress}
                    />
                    <ScheduleView
                      variant="body2"
                      schedules={selectedLocation.resolvedSchedules}
                      className={styles.schedules}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardActionArea>
          {pickupLocationCount > 1 && (
            <CardActions className={styles.actions}>
              <Button
                color="primary"
                onClick={() => dispatch(SetLocationsDialogIsOpen.create(true))}
                disabled={orderType === OrderType.DELIVERY}
              >
                {selectedLocation ? 'Change' : 'Choose'} location...
              </Button>
            </CardActions>
          )}
        </Card>
      </Grid>
    </Grid>
  );
};

export default OrderTypeSelector;
