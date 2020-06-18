import { IAddress } from '../common/types';
import { Typography } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';
import React from 'react';
import classNames from 'classnames';
import styles from './AddressView.module.scss';

interface Props {
  address: IAddress;
  variant?: Variant;
  className?: string;
  textClassName?: string;
}

const AddressView: React.FC<Props> = ({ address, variant = 'body1', className, textClassName }) => {
  const { street1, street2, city, state, zip } = address;

  return (
    <div className={classNames(styles.container, className)}>
      {street1 && (
        <Typography className={textClassName} variant={variant}>
          {street1}
        </Typography>
      )}
      {street2 && (
        <Typography className={textClassName} variant={variant}>
          {street2}
        </Typography>
      )}
      {(city || state || zip) && (
        <Typography className={textClassName} variant={variant}>
          {city}
          {city && state ? ',' : ''} {state} {zip}
        </Typography>
      )}
    </div>
  );
};

export default AddressView;
