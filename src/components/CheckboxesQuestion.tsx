import { Checkbox, FormControlLabel, Link, Typography } from '@material-ui/core';
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
}

const CheckboxesQuestion: React.FC<Props> = ({ question, inputRef, className }) => {
  const isSmall = useIsSmall();

  console.log('question', question);

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
    </div>
  );
};

export default CheckboxesQuestion;
