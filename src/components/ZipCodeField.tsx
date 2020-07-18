import { Autocomplete } from '@material-ui/lab';
import { IAppState } from '../store/app';
import { TextField, TextFieldProps } from '@material-ui/core';
import { ZipcodeScheduleMap } from '../common/types';
import { useSelector } from 'react-redux';
import { zipcodeListSelector, zipcodeSchedulesSelector } from '../store/cms';
import React, { ChangeEvent, useState } from 'react';
import ScheduleView from './ScheduleView';

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

      <ScheduleView variant="body2" schedules={zipcodeSchedules[selectedZipcode]} />
    </>
  );
};

export default ZipCodeField;
