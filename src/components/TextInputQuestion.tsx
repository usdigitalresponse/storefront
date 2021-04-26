import { FieldError, NestDataObject } from 'react-hook-form';
import { ITextInputQuestion } from '../common/types';
import { TextField, TextFieldProps } from '@material-ui/core';
import React from 'react';

interface Props {
  question: ITextInputQuestion;
  inputRef: any;
  errors: NestDataObject<any, FieldError>;
  className?: string;
}

const TextInputQuestion: React.FC<Props> = ({ question, inputRef, errors, className }) => {
  function textFieldProps(label: string, name: string): TextFieldProps {
    const error = errors[name];

    return {
      label,
      name,
      error: !!error,
      helperText: error?.message,
      fullWidth: true,
      variant: 'outlined',
      autoComplete: 'off',
    };
  }

  return (
    <TextField
      className={className}
      {...textFieldProps(question.label, `question-${question.id}`)}
      inputRef={inputRef}
    />
  );
};

export default TextInputQuestion;
