import { Autocomplete } from '@material-ui/lab';
import { TextField, TextFieldProps } from '@material-ui/core';
import { states } from '../common/constants';
import React from 'react';

const StateField: React.FC<TextFieldProps> = props => {
  return props.inputProps?.readOnly ? (
    <TextField {...props} />
  ) : (
    <Autocomplete
      options={Object.keys(states)}
      className={props.className}
      renderInput={params => <TextField {...props} {...params} />}
    />
  );
};

export default StateField;
