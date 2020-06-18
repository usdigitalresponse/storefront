import { Checkbox, FormControlLabel, FormHelperText, useTheme } from '@material-ui/core';
import { FieldError, NestDataObject } from 'react-hook-form';
import { ICheckboxQuestion } from '../common/types';
import { useIsSmall } from '../common/hooks';
import React from 'react';
import classNames from 'classnames';
import styles from './CheckboxQuestion.module.scss';

interface Props {
  question: ICheckboxQuestion;
  inputRef: any;
  errors: NestDataObject<any, FieldError>;
  className?: string;
}

const CheckboxQuestion: React.FC<Props> = ({ question, inputRef, errors, className }) => {
  const isSmall = useIsSmall();
  const theme = useTheme();
  const name = `question-${question.id}`;
  const error: FieldError = errors[name];

  return (
    <div className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      <FormControlLabel
        className={styles.label}
        style={{ color: error ? theme.palette.error.main : undefined }}
        control={<Checkbox name={name} color="primary" inputRef={inputRef} />}
        label={question.label}
      />
      {error && <FormHelperText error>This field is required</FormHelperText>}
    </div>
  );
};

export default CheckboxQuestion;
