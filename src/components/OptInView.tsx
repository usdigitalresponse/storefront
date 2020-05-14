import { Checkbox, FormControlLabel } from '@material-ui/core';
import { useIsSmall } from '../common/hooks';
import React from 'react';
import classNames from 'classnames';
import styles from './OptInView.module.scss';

interface Props {
  className?: string;
}

const OptInView: React.FC<Props> = ({ className }) => {
  const isSmall = useIsSmall();

  return (
    <div className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      <FormControlLabel
        className={styles.label}
        control={<Checkbox name="subsidizedPricing" color="primary" />}
        label="I'd like to learn about subsidized pricing"
      />
      <FormControlLabel
        className={styles.label}
        control={<Checkbox name="communication" color="primary" />}
        label="I'd like to sign up for the mailing list"
      />
    </div>
  );
};

export default OptInView;
