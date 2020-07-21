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

  const [selectedZipcode, setSelectedZipcode] = useState<string>('');

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
      {zipcodeSchedules[selectedZipcode] && zipcodeSchedules[selectedZipcode].length && (
        <>
          <Typography variant="body2" className={styles.note}>
            <Content id="zipcode_delivery_schedule_label" defaultText="Delivery is available for this zipcode" />
          </Typography>
          <ScheduleView variant="body2" schedules={zipcodeSchedules[selectedZipcode]} className={styles.note} />
        </>
      )}
    </>
  );
};

export default ZipCodeField;
