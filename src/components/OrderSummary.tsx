import { Card, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { formatCurrency, formatPercentage } from '../common/format';
import { subtotalSelector } from '../store/cart';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import React from 'react';
import classNames from 'classnames';
import styles from './OrderSummary.module.scss';

interface Props {
  className?: string;
}

const OrderSummary: React.FC<Props> = ({ className }) => {
  const isSmall = useIsSmall();
  const subtotal = useSelector<IAppState, number>(subtotalSelector);
  const taxRate = useSelector<IAppState, number>(state => state.cms.taxRate);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <Card elevation={2} className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      <Typography variant="h4" className={styles.title}>
        Order Summary
      </Typography>
      <div className={styles.line}>
        <Typography variant="body1" className={styles.label}>
          Order Subtotal
        </Typography>
        <Typography variant="body1" className={styles.value}>
          {formatCurrency(subtotal)}
        </Typography>
      </div>
      <div className={styles.line}>
        <Typography variant="body1" className={styles.label}>
          Delivery Fee
        </Typography>
        <Typography variant="body1" className={styles.value}>
          FREE
        </Typography>
      </div>
      <div className={styles.line}>
        <Typography variant="body1" className={styles.label}>
          Tax ({formatPercentage(taxRate)})
        </Typography>
        <Typography variant="body1" className={styles.value}>
          {formatCurrency(tax)}
        </Typography>
      </div>
      <div className={classNames(styles.line, styles.total)}>
        <Typography variant="body1" className={styles.label}>
          Total
        </Typography>
        <Typography variant="body1" className={styles.value}>
          {formatCurrency(total)}
        </Typography>
      </div>
    </Card>
  );
};

export default OrderSummary;
