import { Checkbox, FormControlLabel, FormHelperText, useTheme } from '@material-ui/core';
import { FieldError, NestDataObject } from 'react-hook-form';
import { ICheckoutFormData } from '../common/types';
import { useContent } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import React from 'react';
import classNames from 'classnames';
import styles from './OptInView.module.scss';

interface Props {
  inputRef: any;
  errors: NestDataObject<ICheckoutFormData, FieldError>;
  className?: string;
}

const ConfirmEligibilityView: React.FC<Props> = ({ inputRef, errors, className }) => {
  const isSmall = useIsSmall();
  const theme = useTheme();
  const label = useContent('checkout_donation_confirm_eligibility');

  return label ? (
    <div className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      <FormControlLabel
        className={styles.label}
        style={{ color: errors.eligible ? theme.palette.error.main : undefined }}
        control={<Checkbox name="eligible" color="primary" inputRef={inputRef} />}
        label={label}
      />
      {errors.eligible && <FormHelperText error>{errors.eligible.message}</FormHelperText>}
    </div>
  ) : null;
};

export default ConfirmEligibilityView;
