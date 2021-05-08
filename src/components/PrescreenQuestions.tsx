import { Button, Card, Grid, TextField, TextFieldProps, Typography } from '@material-ui/core';

import { IAppState } from '../store/app';
import {
  IPickupLocation,
  IPrescreenFormData,
  IStockLocation,
  OrderType,
  PrescreenFormField,
  Question,
} from '../common/types';
import { questionsSelector, useContent } from '../store/cms';
import { reverse } from '../common/router';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';

import Content from './Content';
import LanguageSelector from './LanguageSelector';
import Location from './Location';
import Questions from './Questions';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './PrescreenQuestions.module.scss';

interface Props {
  dacl: boolean;
  deliveryOnly: boolean;
  communitySite: string | undefined;
  selectedLocation: IPickupLocation | undefined;
  orderType: OrderType;
  questions: Question[];
  setPushQuestions: Dispatch<SetStateAction<IPrescreenFormData | undefined>>;
  setFinishedPrescreen: Dispatch<SetStateAction<any>>;
}

const PrescreenQuestions: React.FC<Props> = ({
  dacl,
  deliveryOnly,
  communitySite,
  selectedLocation,
  orderType,
  questions,
  setPushQuestions,
  setFinishedPrescreen,
}) => {
  console.log(
    'dacl, deliveryOnly, communitySite, selectedLocation, orderType',
    dacl,
    deliveryOnly,
    communitySite,
    selectedLocation,
    orderType,
  );

  const { register, handleSubmit, triggerValidation, errors, formState, setError, clearError } = useForm<
    IPrescreenFormData
  >({
    reValidateMode: 'onChange',
  });
  const hasErrors = Object.keys(errors).length > 0;
  const history = useHistory();

  if (questions.length === 1 && questions[0] === undefined) {
    questions = [];
  }

  console.log('pre', questions);

  // Content
  const contentFieldIsRequired = useContent('checkout_field_is_required');
  const contentFieldPrescreenStreet1 = useContent('checkout_field_prescreen_street_1');
  const contentFieldPrescreenStreet2 = useContent('checkout_field_prescreen_street_2');
  const contentFieldPrescreenZipcode = useContent('checkout_field_prescreen_zipcode');

  const isSmall = useIsSmall();

  const zipcodeList = useSelector((state: IAppState) => state.cms.validZipcodes);
  console.log('top level zipcodeList', zipcodeList);

  let [noProgramSelected, setNoProgramSelected] = useState(false);
  let [formSubmitted, setFormSubmitted] = useState(false);

  console.log('contentFieldPrescreenStreet1', contentFieldPrescreenStreet1);

  let formIsValid = formState.isValid;

  useEffect(() => {
    console.log('effect errors', formState);
    // if (formState.errors.firstName) {
    //   // do the your logic here
    // }
  }, [formState, formIsValid]);

  async function onSubmit(data: IPrescreenFormData, e: any) {
    //dispatch(CompoundAction([SetIsPaying.create(true), SetError.create(undefined)]));
    e.preventDefault();

    setFormSubmitted(true);
    let valid = await triggerValidation();
    //console.log('valid', valid);
    //console.log('onSubmit formState', formState);
    //console.log('onSubmit formIsValid', formIsValid);

    //console.log('onSubmit zipcodeList', zipcodeList);
    //console.log('onSubmit data', data);
    //console.log('onSubmit e', e);

    let selected: { [index: string]: boolean } = {};
    let fields: { [index: string]: boolean } = {};
    let programEligiblityQuestion: string;
    let programEligible = '';
    Object.keys(data).forEach((key: string) => {
      if (key.indexOf('question') === 0) {
        let nameParts = key.split('_');
        let fieldName = nameParts[0];
        let answer = nameParts[1];

        let val = (data as any)[key];
        console.log('key, nameParts, fieldName, val, answer', key, nameParts, fieldName, val, answer);

        fields[fieldName] = true;
        if (!selected[fieldName]) {
          selected[fieldName] = false;
        }

        if (answer === 'SNAP') {
          programEligiblityQuestion = fieldName;
        }

        let fixedVal = val;
        if (Array.isArray(val)) {
          //single answer multi checkboxes, (for long text with a short "I accept" checkbox) for some reason come as val with type array with "" as the real true/false checked value
          fixedVal = (val as any)[''];
        }

        if (programEligiblityQuestion === fieldName) {
          console.log('answer none and true?', answer, fixedVal);

          if (answer.toLowerCase().indexOf('none') > -1 && fixedVal === true) {
            programEligible = 'No';
          }
        }

        selected[fieldName] = selected[fieldName] || fixedVal;
      }
    });
    if (programEligible === '') {
      programEligible = 'Yes';
    }

    console.log('fields, selected', fields, selected);
    Object.keys(fields).forEach((fieldName) => {
      let fieldSelected = selected[fieldName];
      console.log('fieldName, fieldSelected', fieldName, fieldSelected);
      if (!fieldSelected) {
        //setNoProgramSelected(true);
        console.log('setting error', fieldName);
        setError(fieldName, 'manual', contentFieldIsRequired);

        valid = false;
      }
    });
    // console.log('selected', selected);
    // console.log('errorField', errorField);
    // if (!selected) {
    //   setNoProgramSelected(true);
    //   setError(errorField, { type: 'manual' });

    //   valid = false;
    // }

    let status = 'Stop';
    if (valid) {
      let cleanZip = data.zip.split('-')[0].trim();

      zipcodeList.forEach((zip) => {
        console.log(zip, cleanZip);

        if (zip.zipcode === cleanZip) {
          status = 'Continue';
        }
      });

      if (programEligible === 'No') {
        status = 'InEligible';
      }

      console.log('status', status);
      if (status === 'Continue') {
        //console.log('forwardQuestions', data);
        setPushQuestions(data);
        setFinishedPrescreen(true);
        clearError();
      } else {
        history.push(reverse('noteligible'));
      }
    }

    console.log('errors', errors);
  }

  function textFieldProps(label: string, name: PrescreenFormField, placeholder?: string): TextFieldProps {
    const error = errors[name];

    return {
      label,
      name,
      placeholder,
      error: !!error,
      helperText: error?.message,
      fullWidth: true,
      className: styles.field,
      variant: 'outlined',
    };
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={classNames(styles.container, { [styles.small]: isSmall })}>
        <Grid container spacing={2}>
          {orderType === OrderType.PICKUP ? (
            <>
              {selectedLocation && (
                <Grid item md={8} xs={12}>
                  <Typography variant="h3" className={styles.title}>
                    <Content id="checkout_pickup_location_header" defaultText="Pickup Location" />
                  </Typography>
                  {selectedLocation && (
                    <Location location={selectedLocation} className={styles.selectedLocation} dacl={dacl} />
                  )}
                </Grid>
              )}
            </>
          ) : (
            <>
              <Grid item md={8} xs={12}>
                <Typography variant="h3" className={styles.title}>
                  <Content id="checkout_pickup_location_header" defaultText="Delivery Order" />
                </Typography>
              </Grid>
            </>
          )}

          <Grid item md={8} xs={12}>
            <Card elevation={2} className={styles.form}>
              <Grid container className={styles.section}>
                <Typography variant="h3" className={styles.title}>
                  <Content id="checkout_personal_info_header" defaultText="Applicant Eligibility" />
                </Typography>
                <Grid item md={12} xs={12}>
                  <>Select a language (English/Español) (Por favor, escoge su idioma):</>
                  <br />
                  <LanguageSelector />
                  <hr />
                  {noProgramSelected && formSubmitted && (
                    <p
                      style={{
                        color: 'rgb(244, 67, 54)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                      }}
                    >
                      Please select an option below. If none apply, please select the None option.
                    </p>
                  )}
                  {questions.length !== 0 && (
                    <Questions
                      register={register}
                      errors={errors}
                      questionClassName={styles.field}
                      questions={questions}
                      clearError={clearError}

                    />
                  )}

                  <Grid item md={8} xs={12}>
                    <TextField
                      {...textFieldProps(contentFieldPrescreenStreet1 || 'Street 1', 'street1', '123 Main St.')}
                      inputRef={register({ required: contentFieldIsRequired || 'Street 1 is required' })}
                    />
                    <TextField
                      {...textFieldProps(
                        contentFieldPrescreenStreet2 || 'Street 2',
                        'street2',
                        'Apt 4B, Floor 2, etc.',
                      )}
                      inputRef={register}
                    />

                    <TextField
                      {...textFieldProps(contentFieldPrescreenZipcode || 'Zip Code', 'zip')}
                      inputRef={register({
                        required: 'Zip code is required',
                        pattern: {
                          value: /^\d{5}(>?-\d{4}){0,1}$/,
                          message: 'Please enter a valid Zip Code',
                        },
                      })}
                    />
                  </Grid>
                </Grid>
                <Grid item md={12} xs={12} container className={styles.right}>
                  <div className={!isSmall ? styles.sidebar : undefined}>
                    <br />
                    {/* <OrderSummary className={styles.summary} showLineItems editable={!isDonationRequest} showTip /> */}
                    <Button
                      className={classNames()}
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      type="submit"
                    >
                      <Content id="prescreen_submit_button_label" defaultText="Check Eligibility" />
                      {/* {isPaying && <CircularProgress size={26} className={styles.spinner} />}
                      {!isPaying && } */}
                    </Button>
                    {hasErrors && (
                      <Typography className={styles.errorMessage} color="error">
                        {/* {paymentError || (
                          <Content id="checkout_error_please_fix" defaultText="Please fix the errors in your form" />
                        )} */}
                        <Content id="prescreen_error_please_fix" defaultText="Please fix the errors and submit again" />
                      </Typography>
                    )}
                    {/* {items.length === 0 && (
                      <Typography className={styles.errorMessage}>
                        <Content id="checkout_error_cart_empty" defaultText="Your cart is empty" />
                      </Typography>
                    )} */}
                  </div>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default PrescreenQuestions;
