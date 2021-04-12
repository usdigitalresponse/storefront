import { Button, Card, Grid, TextField, TextFieldProps, Typography } from '@material-ui/core';

import { IAppState } from '../store/app';
import {
  ILocationPreference,
  IPickupLocation,
  IPrescreenFormData,
  IStockLocation,
  OrderType,
  PrescreenFormField,
  Question,
} from '../common/types';
import { pickupLocationsSelector, questionsSelector, useContent } from '../store/cms';
import { reverse } from '../common/router';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';

import Location from './Location';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import classNames from 'classnames';

interface Props {
  locationPrefs: ILocationPreference;
}

const LocationPreferences: React.FC<Props> = ({ locationPrefs }) => {
  console.log('locationPrefs', locationPrefs);
  const pickupLocations = useSelector<IAppState, Array<IPickupLocation | IStockLocation>>(pickupLocationsSelector);

  let location1, location2, location3;
  pickupLocations.forEach((location) => {
    console.log('location', location.id, location);
    if (location.id === locationPrefs.location1) {
      location1 = location;
    }
    if (location.id === locationPrefs.location2) {
      location2 = location;
    }
    if (location.id === locationPrefs.location3) {
      location3 = location;
    }
  });

  if (!locationPrefs.location1) {
    return <>
      <a href="https://sites.google.com/dcgreens.org/produce-plus-direct-vendor-pro/home" target="_blank" rel="noreferrer">Learn about Pickup Site Locations</a>
    </>;
  } else {
    return <>
      <a href="https://sites.google.com/dcgreens.org/produce-plus-direct-vendor-pro/home" target="_blank" rel="noreferrer">Learn about Pickup Site Locations</a>
      <ul>
        {location1 && (
          <li>
            <Location location={location1} />
          </li>
        )}
        {location2 && (
          <li>
            <Location location={location2} />
          </li>
        )}
        {location3 && (
          <li>
            <Location location={location3} />
          </li>
        )}
      </ul>
    </>
  }
};

export default LocationPreferences;
