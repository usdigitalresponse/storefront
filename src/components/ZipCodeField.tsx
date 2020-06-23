import { Autocomplete } from '@material-ui/lab';
import { IAppState } from '../store/app';
import { TextField, TextFieldProps } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { validZipcodesSelector } from '../store/cms';
import React from 'react';

const ZipCodeField: React.FC<TextFieldProps> = (props) => {
  const validZipcodes = useSelector<IAppState, string[]>(validZipcodesSelector);

  return validZipcodes.length === 0 ? (
    <TextField {...props} />
  ) : (
    <Autocomplete
      options={validZipcodes}
      className={props.className}
      renderInput={(params) => <TextField {...props} {...params} />}
    />
  );
};

export default ZipCodeField;
