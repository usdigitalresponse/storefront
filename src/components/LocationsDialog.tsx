import { Dialog, DialogContent, DialogTitle, IconButton, List, ListItem, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { IPickupLocation } from '../common/types';
import { SetLocationsDialogIsOpen, SetSelectedLocation } from '../store/cart';
import { pickupLocationsSelector } from '../store/cms';
import { useDispatch, useSelector } from 'react-redux';
import { useIsSmall } from '../common/hooks';
import AddressView from './AddressView';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import classNames from 'classnames';
import styles from './LocationsDialog.module.scss';

interface Props {}

const LocationsDialog: React.FC<Props> = () => {
  const isSmall = useIsSmall();
  const isOpen = useSelector<IAppState, boolean>(state => state.cart.locationsDialogIsOpen);
  const dispatch = useDispatch();
  const pickupLocations = useSelector<IAppState, IPickupLocation[]>(pickupLocationsSelector);
  const selectedLocation = useSelector<IAppState, string | undefined>(state => state.cart.selectedLocation);

  function onClose() {
    dispatch(SetLocationsDialogIsOpen.create(false));
  }

  return (
    <Dialog
      fullScreen={isSmall}
      open={isOpen}
      onClose={onClose}
      scroll="paper"
      className={classNames(styles.dialog, { [styles.small]: isSmall })}
    >
      <DialogTitle className={styles.title} disableTypography>
        <Typography variant="h2" className={styles.titleText}>
          Select a location
        </Typography>
        {onClose ? (
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon className={styles.closeIcon} />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent dividers className={styles.content}>
        <List>
          {pickupLocations.map(location => (
            <ListItem
              key={location.id}
              className={styles.item}
              selected={location.id === selectedLocation}
              button
              onClick={() => dispatch(SetSelectedLocation.create(location.id))}
            >
              <Typography variant="body1" className={styles.itemName}>
                {location.name}
              </Typography>
              <AddressView address={location.address} className={styles.itemAddress} variant="body2" />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default LocationsDialog;
