import { Checkbox, FormControlLabel, FormHelperText, Link, Typography } from '@material-ui/core';
import { FieldError, NestDataObject, useForm } from 'react-hook-form';
import { ICheckboxesQuestion, ICheckoutFormData } from '../common/types';
import { useIsSmall } from '../common/hooks';
import React, {MouseEvent} from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
import styles from './CheckboxesQuestion.module.scss';

interface Props {
  question: ICheckboxesQuestion;
  inputRef: any;
  className?: string;
  contentFieldIsRequired: string;
  errors: NestDataObject<any, FieldError>;
  clearError: (name?: string | string[] | undefined) => void
}

const CheckboxesQuestion: React.FC<Props> = ({ question, inputRef, className, contentFieldIsRequired, errors, clearError }) => {
  const isSmall = useIsSmall();
  const questionId = `question-${question.id}`
  const error = errors[questionId];

  console.log('question', question, error);

  const handleClick = async (event: MouseEvent ) => {
    console.log("event", event)
    //let valid = await triggerValidation();
    clearError(questionId)

  }

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
          control={<Checkbox color="primary" inputRef={inputRef} name={`question-${question.id}_${option}`} onClick={handleClick} />}
          label={option}
        />
      ))}
      <FormHelperText error>{error && error.message}</FormHelperText>
    </div>
  );
};

export default CheckboxesQuestion;
