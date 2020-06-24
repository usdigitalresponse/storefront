import { IPickupLocation, IStockLocation, isStockLocation } from '../common/types';
import { Typography } from '@material-ui/core';
import AddressView from './AddressView';
import React from 'react';
import ScheduleView from './ScheduleView';
import styles from './Location.module.scss';

interface Props {
  location: IPickupLocation | IStockLocation;
  className?: string;
}

const Location: React.FC<Props> = ({ location, className }) => {
  return (
    <div className={className}>
      {isStockLocation(location) && location.stockRemaining === 0 && (
        <Typography variant="body2" className={styles.itemName}>
          Sold out - Waitlist Only
        </Typography>
      )}
      <Typography variant="body1" className={styles.itemName}>
        {location.name}
      </Typography>
      <AddressView address={location.address} variant="body2" />
      <ScheduleView variant="body2" schedules={location.resolvedSchedules} className={styles.schedules} />
    </div>
  );
};

export default Location;
