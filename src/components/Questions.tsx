import { FieldError, NestDataObject } from 'react-hook-form';
import { IAppState } from '../store/app';
import { Question } from '../common/types';
import { questionsSelector } from '../store/cms';
import { useSelector } from 'react-redux';
import CheckboxQuestion from './CheckboxQuestion';
import CheckboxesQuestion from './CheckboxesQuestion';
import React from 'react';
import TextInputQuestion from './TextInputQuestion';

interface Props {
  register: any;
  errors: NestDataObject<any, FieldError>;
  questionClassName?: string;
}

const Questions: React.FC<Props> = ({ register, errors, questionClassName }) => {
  const questions = useSelector<IAppState, Question[]>(questionsSelector);

  return (
    <>
      {questions.map((question) => {
        switch (question.type) {
          case 'Text Input':
            return (
              <TextInputQuestion
                key={question.id}
                question={question}
                errors={errors}
                inputRef={register({ required: question.required ? `${question.label} is required` : undefined })}
                className={questionClassName}
              />
            );
          case 'Single Checkbox':
            return (
              <CheckboxQuestion
                key={question.id}
                question={question}
                errors={errors}
                inputRef={register({ required: question.required ? `Field is required` : undefined })}
                className={questionClassName}
              />
            );
          case 'Multiple Checkboxes':
            return (
              <CheckboxesQuestion
                key={question.id}
                question={question}
                inputRef={register}
                className={questionClassName}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
};

export default Questions;
