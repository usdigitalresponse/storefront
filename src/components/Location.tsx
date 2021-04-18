import { IAppState } from '../store/app';
import { IConfig, IPickupLocation, IStockLocation, InventoryRecord, isStockLocation } from '../common/types';
import { Typography } from '@material-ui/core';
import { inventorySelector } from '../store/cms';
import { useSelector } from 'react-redux';
import AddressView from './AddressView';
import React from 'react';
import ScheduleView from './ScheduleView';
import styles from './Location.module.scss';

interface Props {
  location: IPickupLocation | IStockLocation;
  className?: string;
  dacl?: boolean
}

const Location: React.FC<Props> = ({ location, className, dacl }) => {

  const inventory = useSelector<IAppState, InventoryRecord[]>(inventorySelector);
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);

  let matchedItem, stockRemaining = -1

  if( config.lotteryEnabled ) {
    //console.group("Location")
    inventory.forEach((item) =>
    {
      //console.log("item", item)
      if( item.stockLocation === location.id ) {
        //console.log("match", item)
        if( item.name.indexOf("DACL") > -1 === dacl ) {
          matchedItem = item
          stockRemaining = (matchedItem as InventoryRecord).stockRemaining || -2
        }
      }
    })
    //console.groupEnd()
    //console.log("matchedItem", matchedItem)
  }

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
      {matchedItem ? <>
        {stockRemaining > 5 ? <>
          Slots remaining: {stockRemaining}
        </> : <>
            {stockRemaining < 1 ?
              <Typography variant="body2" className={styles.itemName}>
                Sold out - Waitlist Only
              </Typography>
            : <>
                Less than five (5) slots remaining
            </>
            }
        </>}
      </> : <></>}
      <ScheduleView variant="body2" schedules={location.resolvedSchedules} className={styles.schedules} />
    </div>
  );
};

export default Location;
