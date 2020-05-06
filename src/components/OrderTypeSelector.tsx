import { Button, Card, CardActionArea, CardActions, Grid, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { OrderType } from '../common/types';
import { SetLocationsDialogIsOpen, SetOrderType } from '../store/cart';
import { useDispatch, useSelector } from 'react-redux';
import { useIsSmall } from '../common/hooks';
import CheckedIcon from '@material-ui/icons/CheckBox';
import React from 'react';
import UncheckedIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import classNames from 'classnames';
import styles from './OrderTypeSelector.module.scss';

const OrderTypeSelector: React.FC = () => {
  const isSmall = useIsSmall();
  const dispatch = useDispatch();
  const orderType = useSelector<IAppState, OrderType>(state => state.cart.orderType);

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        <Card elevation={2} className={classNames(styles.option, { [styles.small]: isSmall })}>
          <CardActionArea onClick={() => dispatch(SetOrderType.create(OrderType.DELIVERY))}>
            <div className={classNames(styles.content, styles.delivery)}>
              <div className={styles.check}>
                {orderType === OrderType.DELIVERY ? <CheckedIcon color="primary" /> : <UncheckedIcon color="primary" />}
              </div>
              <div className={styles.label}>
                <Typography variant="h4" className={styles.title}>
                  Deliver to Me
                </Typography>
                <Typography variant="body1" className={styles.description}>
                  Credit / Debit Card Only
                </Typography>
              </div>
            </div>
          </CardActionArea>
        </Card>
      </Grid>
      <Grid item md={6} xs={12}>
        <Card elevation={2} className={classNames(styles.option, { [styles.small]: isSmall })}>
          <CardActionArea onClick={() => dispatch(SetOrderType.create(OrderType.PICKUP))}>
            <div className={styles.content}>
              <div className={styles.check}>
                {orderType === OrderType.PICKUP ? <CheckedIcon color="primary" /> : <UncheckedIcon color="primary" />}
              </div>
              <div className={styles.label}>
                <Typography variant="h4" className={styles.title}>
                  Pickup
                </Typography>
                <Typography variant="body1" className={styles.description}>
                  Required for EBT or Cash
                </Typography>
              </div>
            </div>
          </CardActionArea>
          <CardActions className={styles.actions}>
            <Button
              color="primary"
              disabled={orderType === OrderType.DELIVERY}
              onClick={() => dispatch(SetLocationsDialogIsOpen.create(true))}
            >
              Choose location...
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OrderTypeSelector;
