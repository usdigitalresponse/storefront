import { FieldError, NestDataObject } from 'react-hook-form';
import { IAppState } from '../store/app';
import { Question, QuestionType } from '../common/types';
import { questionsSelector, useContent } from '../store/cms';
import { useSelector } from 'react-redux';
import CheckboxQuestion from './CheckboxQuestion';
import CheckboxesQuestion from './CheckboxesQuestion';
import React from 'react';
import SelectQuestion from './SelectQuestion';
import TextInputQuestion from './TextInputQuestion';

interface Props {
  register: any;
  errors: NestDataObject<any, FieldError>;
  questionClassName?: string;
  questions: any[];
}

const Questions: React.FC<Props> = ({ register, errors, questionClassName, questions }) => {
  const contentFieldIsRequired = useContent('checkout_field_is_required');

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
                inputRef={register({ required: question.required ? contentFieldIsRequired : undefined })}
                className={questionClassName}
              />
            );
          case 'Single Checkbox':
            return (
              <CheckboxQuestion
                key={question.id}
                question={question}
                errors={errors}
                inputRef={register({ required: question.required ? contentFieldIsRequired : undefined })}
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
          case 'Select':
            return (
              <SelectQuestion
                key={question.id}
                question={question}
                inputRef={register({ required: question.required ? contentFieldIsRequired : undefined })}
                errors={errors}
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
