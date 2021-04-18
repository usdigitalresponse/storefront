import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  MenuItem,
  // TextField,
  Typography,
} from '@material-ui/core';
import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { ILocationPreference, IPickupLocation, IStockLocation } from '../common/types';
import {
  SetLocationPreferences,
  SetLocationsDialogIsOpen,
  SetSelectedLocation,
  locationPreferencesSelector,
} from '../store/cart';
import { pickupLocationsSelector } from '../store/cms';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useIsSmall } from '../common/hooks';
import CloseIcon from '@material-ui/icons/Close';
import React, { Dispatch, FormEvent, SetStateAction } from 'react';
import ReactHookFormSelect from './ReactHookFormSelect';
// import SearchIcon from '@material-ui/icons/Search';
import Location from './Location';
import LocationPreferenceLinks from './LocationPreferenceLinks';
import ScheduleView from './ScheduleView';
import classNames from 'classnames';
import styles from './LocationsDialog.module.scss';

interface Props {}

const LocationsDialog: React.FC<Props> = () => {
  const { register, control, setError, errors, clearError } = useForm();
  const isSmall = useIsSmall();
  const isOpen = useSelector<IAppState, boolean>((state) => state.cart.locationsDialogIsOpen);
  const dispatch = useDispatch();
  const pickupLocations = useSelector<IAppState, Array<IPickupLocation | IStockLocation>>(pickupLocationsSelector);
  const selectedLocation = useSelector<IAppState, string | undefined>((state) => state.cart.selectedLocation);
  const lotteryEnabled = useSelector((state: IAppState) => state.cms.config.lotteryEnabled);
  const locationPreferences = useSelector<IAppState, ILocationPreference>(locationPreferencesSelector);

  const publicLocations: IPickupLocation[] = [];
  pickupLocations.forEach((location) => {
    if (!location.communitySite && location.name && location.name?.trim() !== "") publicLocations.push(location);
  });

  function onClose() {
    dispatch(SetLocationsDialogIsOpen.create(false));
  }

  function onSelection(id: string) {
    return () => {
      dispatch(SetSelectedLocation.create(id));
      onClose();
    };
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearError();
    const values = control.getValues() as ILocationPreference;
    console.log('values', values);
    console.log(values.location2 === values.location1);
    let errors = false;

    if (!values.location2) {
      setError('location2', 'manual', 'Must select 3 locations');
      errors = true;
    }
    if (!values.location3 ) {
      setError('location3', 'manual', 'Must select 3 locations');
      errors = true;
    }

    if (values.location2 === values.location1) {
      setError('location2', 'manual', 'Cannot select the same location twice');
      console.log('setting location2 error');
      errors = true;
    }
    if (values.location3 === values.location1 || values.location3 === values.location2) {
      setError('location3', 'manual', 'Cannot select the same location twice');
      console.log('setting location3 error');
      errors = true;
    }

    if (!errors) {
      dispatch(CompoundAction([SetLocationPreferences.create(values), SetLocationsDialogIsOpen.create(false)]));
    }
  }

  let locations = publicLocations.map((location) => (
    <MenuItem key={location.id} value={location.id}>
      <>
        {location.name} {location.address.street1}{' '}
        <ScheduleView variant="body2" schedules={location.resolvedSchedules} className={styles.schedules} />{' '}
      </>
    </MenuItem>
  ));

  console.log('control', control);
  console.log('getValues', control.getValues());

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
            {!lotteryEnabled ? 'Select a location' : 'Pick three locations in order of your preference'}
          </Typography>
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon className={styles.closeIcon} />
          </IconButton>
        </div>
        {/* TODO: Implement LBS search */}
        {/* <div className={styles.search}>
          <TextField
            fullWidth
            variant="outlined"
            InputProps={{ startAdornment: <SearchIcon className={styles.searchIcon} /> }}
            placeholder="e.g. address or zip code"
          />
        </div> */}
      </DialogTitle>
      <DialogContent dividers className={styles.content}>
        {!lotteryEnabled ? (
          <List className={styles.list}>
            {pickupLocations.map((location) => (
              <ListItem
                key={location.id}
                className={styles.item}
                selected={location.id === selectedLocation}
                button
                onClick={onSelection(location.id)}
              >
                <Location location={location} />
              </ListItem>
            ))}
          </List>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <ReactHookFormSelect
                id="location-select-1"
                name="location1"
                label="First Choice Location"
                defaultValue={locationPreferences?.location1 || ''}
                control={control}
                errors={errors}
              >
                {locations}
              </ReactHookFormSelect>
              <ReactHookFormSelect
                id="location-select-2"
                name="location2"
                label="Second Choice Location"
                defaultValue={locationPreferences?.location2 || ''}
                control={control}
                errors={errors}
              >
                {locations}
              </ReactHookFormSelect>
              <ReactHookFormSelect
                id="location-select-3"
                name="location3"
                label="Third Choice Location"
                defaultValue={locationPreferences?.location3 || ''}
                control={control}
                errors={errors}
              >
                {locations}
              </ReactHookFormSelect>

              <Button
                className={classNames()}
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                style={{ width: '80%', margin: '10px' }}
              >
                Continue
              </Button>

              <hr/>

                <LocationPreferenceLinks/>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LocationsDialog;
