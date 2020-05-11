import { Card, Typography } from '@material-ui/core';
import { formatCurrency } from '../common/format';
import { useIsSmall } from '../common/hooks';
import React from 'react';
import classNames from 'classnames';
import styles from './DonationSummary.module.scss';

interface Props {
  amount: number;
  className?: string;
}

const DonationSummary: React.FC<Props> = ({ amount, className }) => {
  const isSmall = useIsSmall();
  return (
    <Card elevation={2} className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      <Typography variant="h4" className={styles.title}>
        Donation Summary
      </Typography>
      <div className={styles.section}>
        <div className={styles.lineItem}>
          <Typography variant="body1" className={styles.label}>
            Donation
          </Typography>
          <Typography variant="body1" className={styles.qty}>
            &times; 1
          </Typography>
          <Typography variant="body1" className={styles.value}>
            {formatCurrency(amount)}
          </Typography>
        </div>
      </div>
      <div className={classNames(styles.line, styles.total)}>
        <Typography variant="body1" className={styles.label}>
          Total
        </Typography>
        <Typography variant="body1" className={styles.value}>
          {formatCurrency(amount)}
        </Typography>
      </div>
    </Card>
  );
};

export default DonationSummary;
