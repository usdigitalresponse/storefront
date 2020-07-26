import { Autocomplete } from '@material-ui/lab';
import { IAppState } from '../store/app';
import { TextField, TextFieldProps, Typography } from '@material-ui/core';
import { ZipcodeScheduleMap } from '../common/types';
import { useSelector } from 'react-redux';
import { zipcodeListSelector, zipcodeSchedulesSelector } from '../store/cms';
import Content from './Content';
import React, { ChangeEvent, useState } from 'react';
import ScheduleView from './ScheduleView';
import styles from './ZipCodeField.module.scss';

const ZipCodeField: React.FC<TextFieldProps> = (props) => {
  const zipcodeList = useSelector<IAppState, string[]>(zipcodeListSelector);
  const zipcodeSchedules = useSelector<IAppState, ZipcodeScheduleMap>(zipcodeSchedulesSelector);

  // We should be using react-hook-form's watch('zip') instead of `useState` to control the zip code value
  // but it causes a bug that prevents users from typing in the TextField. Leaving it like this for now.
  //
  // Material UI Autocomplete throws a warning if passed an empty string; its empty state is null
  const [selectedZipcode, setSelectedZipcode] = useState<string | null>(null);

  return zipcodeList.length === 0 ? (
    <TextField {...props} />
  ) : (
    <>
      <Autocomplete
        value={selectedZipcode}
        onChange={(e: ChangeEvent<any>, value: string | null) => {
          setSelectedZipcode(value || '');
        }}
        options={zipcodeList}
        className={props.className}
        renderInput={(params) => <TextField {...props} {...params} />}
      />
      {selectedZipcode && zipcodeSchedules[selectedZipcode] && zipcodeSchedules[selectedZipcode].length > 0 ? (
        <>
          <Typography variant="body2" className={styles.note}>
            <Content
              id="zipcode_delivery_schedule_label"
              defaultText="Delivery to this zip code has the following schedule:"
            />
          </Typography>
          <ScheduleView variant="body2" schedules={zipcodeSchedules[selectedZipcode]} className={styles.note} />
        </>
      ) : null}
    </>
  );
};

export default ZipCodeField;
