import { Autocomplete } from '@material-ui/lab';
import { FieldError, NestDataObject } from 'react-hook-form';
import { ISelectQuestion } from '../common/types';
import { TextField, TextFieldProps } from '@material-ui/core';
import React from 'react';

interface Props {
  question: ISelectQuestion;
  inputRef: any;
  errors: NestDataObject<any, FieldError>;
  className?: string;
}

const SelectQuestion: React.FC<Props> = ({ question, inputRef, errors, className }) => {
  function textFieldProps(label: string, name: string): TextFieldProps {
    const error = errors[name];

    return {
      label,
      name,
      error: !!error,
      helperText: error?.message,
      fullWidth: true,
      variant: 'outlined',
    };
  }

  return (
    <Autocomplete
      options={question.options}
      className={className}
      renderInput={(params) => (
        <TextField {...textFieldProps(question.label, `question-${question.id}`)} {...params} inputRef={inputRef} />
      )}
    />
  );
};

export default SelectQuestion;
