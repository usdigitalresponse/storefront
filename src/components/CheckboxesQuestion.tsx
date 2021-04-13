import { Checkbox, FormControlLabel, FormHelperText, Link, Typography } from '@material-ui/core';
import { FieldError, NestDataObject } from 'react-hook-form';
import { ICheckboxesQuestion } from '../common/types';
import { useIsSmall } from '../common/hooks';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
import styles from './CheckboxesQuestion.module.scss';

interface Props {
  question: ICheckboxesQuestion;
  inputRef: any;
  className?: string;
  contentFieldIsRequired: string;
  errors: NestDataObject<any, FieldError>;
}

const CheckboxesQuestion: React.FC<Props> = ({ question, inputRef, className, contentFieldIsRequired, errors }) => {
  const isSmall = useIsSmall();
  const error = errors[`question-${question.id}`];

  console.log('question', question, error);

  return (
    <div className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      <Typography variant="body1" className={styles.note}>
        {question.markdownLabel ? (
          <>
            <ReactMarkdown
              unwrapDisallowed={false}
              renderers={{ link: Link, linkReference: Link }}
              source={question.markdownLabel}
            />
          </>
        ) : (
          <>{question.label}:</>
        )}
      </Typography>
      {question.options.map((option) => (
        <FormControlLabel
          key={option}
          control={<Checkbox color="primary" inputRef={inputRef} name={`question-${question.id}_${option}`} />}
          label={option}
        />
      ))}
      <FormHelperText error>{error && error.message}</FormHelperText>
    </div>
  );
};

export default CheckboxesQuestion;
