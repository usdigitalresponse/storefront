import { Checkbox, FormControlLabel } from '@material-ui/core';
import { useContent } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import React from 'react';
import classNames from 'classnames';
import styles from './OptInView.module.scss';

interface Props {
  inputRef: any;
  className?: string;
}

const OptInView: React.FC<Props> = ({ inputRef, className }) => {
  const isSmall = useIsSmall();
  const commsLabel = useContent('checkout_opt_in_comms_label');
  const subsidyLabel = useContent('checkout_opt_in_subsidy_label');

  return (
    <div className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      {subsidyLabel && (
        <FormControlLabel
          className={styles.label}
          control={<Checkbox name="optInSubsidy" color="primary" inputRef={inputRef} />}
          label={subsidyLabel}
        />
      )}
      <FormControlLabel
        className={styles.label}
        control={<Checkbox name="optInComms" color="primary" inputRef={inputRef} />}
        label={commsLabel}
      />
    </div>
  );
};

export default OptInView;
