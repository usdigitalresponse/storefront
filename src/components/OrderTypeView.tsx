import { Card, Link, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { OrderType } from '../common/types';
import { SetOrderType } from '../store/cart';
import { useDispatch, useSelector } from 'react-redux';
import InfoIcon from '@material-ui/icons/Info';
import React from 'react';
import classNames from 'classnames';
import styles from './OrderTypeView.module.scss';

interface Props {
  className?: string;
}

const OrderTypeView: React.FC<Props> = ({ className }) => {
  const orderType = useSelector<IAppState, OrderType>(state => state.cart.orderType);
  const dispatch = useDispatch();

  return (
    <Card elevation={2} className={classNames(styles.container, className)}>
      <InfoIcon color="primary" className={styles.icon} />
      <Typography variant="body1" className={styles.title}>
        {orderType}
      </Typography>
      {orderType === OrderType.DELIVERY && (
        <Typography variant="body1" className={styles.label}>
          Credit / Debit cards only. To pay with EBT or Cash,{' '}
          <Link onClick={() => dispatch(SetOrderType.create(OrderType.PICKUP))} className={styles.link}>
            switch to pickup
          </Link>
        </Typography>
      )}
      {orderType === OrderType.PICKUP && (
        <Typography variant="body1" className={styles.label}>
          To have your order delivered,{' '}
          <Link onClick={() => dispatch(SetOrderType.create(OrderType.DELIVERY))} className={styles.link}>
            switch to delivery
          </Link>
        </Typography>
      )}
    </Card>
  );
};

export default OrderTypeView;
