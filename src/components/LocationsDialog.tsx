import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
} from '@material-ui/core';
import { IAppState } from '../store/app';
import { IPickupLocation } from '../common/types';
import { SetLocationsDialogIsOpen, SetSelectedLocation } from '../store/cart';
import { pickupLocationsSelector } from '../store/cms';
import { useDispatch, useSelector } from 'react-redux';
import { useIsSmall } from '../common/hooks';
import AddressView from './AddressView';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import SearchIcon from '@material-ui/icons/Search';
import classNames from 'classnames';
import styles from './LocationsDialog.module.scss';

interface Props {}

const LocationsDialog: React.FC<Props> = () => {
  const isSmall = useIsSmall();
  const isOpen = useSelector<IAppState, boolean>((state) => state.cart.locationsDialogIsOpen);
  const dispatch = useDispatch();
  const pickupLocations = useSelector<IAppState, IPickupLocation[]>(pickupLocationsSelector);
  const selectedLocation = useSelector<IAppState, string | undefined>((state) => state.cart.selectedLocation);

  function onClose() {
    dispatch(SetLocationsDialogIsOpen.create(false));
  }

  function onSelection(id: string) {
    return () => {
      dispatch(SetSelectedLocation.create(id));
      onClose();
    };
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
        <div className={styles.titleTop}>
          <Typography variant="h2" className={styles.titleText}>
            Select a location
          </Typography>
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon className={styles.closeIcon} />
          </IconButton>
        </div>
        <div className={styles.search}>
          <TextField
            fullWidth
            variant="outlined"
            InputProps={{ startAdornment: <SearchIcon className={styles.searchIcon} /> }}
            placeholder="e.g. address or zip code"
          />
        </div>
      </DialogTitle>
      <DialogContent dividers className={styles.content}>
        <List className={styles.list}>
          {pickupLocations.map((location) => (
            <ListItem
              key={location.id}
              className={styles.item}
              selected={location.id === selectedLocation}
              button
              onClick={onSelection(location.id)}
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
