import { Autocomplete } from '@material-ui/lab';
import { TextField, TextFieldProps } from '@material-ui/core';
import React from 'react';

const ZipCodeField: React.FC<TextFieldProps> = props => {
  const zipCodes = ['12345', '35566', '23425', '23423'];

  return zipCodes == null ? (
    <TextField {...props} />
  ) : (
    <Autocomplete
      options={zipCodes}
      className={props.className}
      renderInput={params => <TextField {...props} {...params} />}
    />
  );
};

export default ZipCodeField;
