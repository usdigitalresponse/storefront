import {
  Button,
  Card,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Grid,
  Input,
  Link,
  Radio,
  RadioGroup,
  TextField,
  TextFieldProps,
  Typography,
} from '@material-ui/core';

import { IAppState } from '../store/app';
import { IConfig, IOrderItem, IPrescreenFormData, PrescreenFormField, Question } from '../common/types';
import { itemsSelector } from '../store/cart';
import { questionsSelector, useContent, zipcodeListSelector } from '../store/cms';
import { reverse } from '../common/router';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';

import Content from './Content';
import LanguageSelector from './LanguageSelector';
import Questions from './Questions';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './PrescreenQuestions.module.scss';

interface Props {
  className?: string;
  textClassName?: string;
  setFinishedPrescreen: (finished: boolean) => any;
}

const PrescreenQuestions: React.FC<Props> = ({ className, textClassName, setFinishedPrescreen }) => {
  const { register, watch, handleSubmit, triggerValidation, errors, clearError, getValues, formState, setError } = useForm<IPrescreenFormData>({ reValidateMode: "onChange"});
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  const hasErrors = Object.keys(errors).length > 0;
  const history = useHistory();

  const allQuestions = useSelector<IAppState, Question[]>(questionsSelector);
  let questions: Question[] = []

  allQuestions.forEach((question) => {
    console.log("question", question.preScreen)
    if( question ) {
    if (question.preScreen === true) {
      questions.push(question)
    }
    }
  })

  if( questions.length === 1 && questions[0] === undefined ) {
    questions = []
  }

  console.log("all", allQuestions)
  console.log("pre", questions)

  // Content
  const contentPayNowOptionLabel = useContent('pay_now_option_label');
  const contentPayLaterOptionLabel = useContent('pay_later_option_label');
  const contentFieldIsRequired = useContent('checkout_field_is_required');
  const contentFieldName = useContent('checkout_field_name');
  const contentFieldNameFirstLast = useContent('checkout_field_name_first_last');
  const contentFieldNameFirstLastRequired = useContent('checkout_field_name_first_last_required');
  const contentFieldPhoneNumber = useContent('checkout_field_phone_number');
  const contentFieldEmail = useContent('checkout_field_email');
  const contentFieldPrescreenStreet1 = useContent('checkout_field_prescreen_street_1');
  const contentFieldPrescreenStreet2 = useContent('checkout_field_prescreen_street_2');
  const contentFieldPrescreenCity = useContent('checkout_field_prescreen_city');
  const contentFieldPrescreenState = useContent('checkout_field_prescreen_state');
  const contentFieldPrescreenZipcode = useContent('checkout_field_prescreen_zipcode');
  const contentLocationOptionChange = useContent('checkout_location_option_change');
  const contentLocationOptionChoose = useContent('checkout_location_option_choose');

  const isSmall = useIsSmall();

  const zipcodeList = useSelector<IAppState, string[]>(zipcodeListSelector);

  let [noProgramSelected, setNoProgramSelected] = useState(false)
  let [formSubmitted, setFormSubmitted] = useState(false)

  console.log("contentFieldPrescreenStreet1",contentFieldPrescreenStreet1)

  let formIsValid = formState.isValid

  useEffect(() => {
    console.log("effect errors", formState)
    // if (formState.errors.firstName) {
    //   // do the your logic here
    // }
  }, [formState, formIsValid]);

  async function onSubmit(data: IPrescreenFormData, e: any) {
    //dispatch(CompoundAction([SetIsPaying.create(true), SetError.create(undefined)]));
    e.preventDefault()

    setFormSubmitted(true)
   let valid = await triggerValidation()
   console.log("valid", valid)
   console.log("onSubmit formState", formState)
    console.log("onSubmit formIsValid", formIsValid)

    console.log("onSubmit zipcodeList", zipcodeList)
   console.log("onSubmit data", data)
   console.log("onSubmit e", e)

   let selected = false
   let errorField = ""
  Object.keys(data).forEach((key: string) => {
    if( key.indexOf("question") === 0 ) {
      selected = selected || (data as any)[key]
      if( key.indexOf("None of these") ) {
        errorField = key
      }
    }
  })

  console.log("selected", selected)
  console.log("errorField", errorField)
  if( !selected ) {
    setNoProgramSelected(true)
    setError(errorField, {type: "manual"})

    valid = false
  }

  let status = "Stop";
   if( valid ) {
     let cleanZip = data.zip.split("-")[0].trim()

      zipcodeList.forEach((zip) => {
        console.log(zip, cleanZip)

        if (zip === cleanZip ) {
          status = "Continue"
        }
      })
     if (status === "Continue") {
       setFinishedPrescreen(true)
     } else {
       history.push(reverse('noteligible'))
     }

    }
  }

  async function onError(errors: any, e: any) {
    //dispatch(CompoundAction([SetIsPaying.create(true), SetError.create(undefined)]));

    console.log("onError errors", errors)
    console.log("onError e", e)

    const status = "Continue";
    if (status !== "Continue") {
      history.push(reverse('checkout'));
    }
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
          <Grid item md={8} xs={12}>
            <Card elevation={2} className={styles.form}>
              <Grid container className={styles.section}>
                <Typography variant="h3" className={styles.title}>
                  <Content id="checkout_personal_info_header" defaultText="Your Eligibility" />
                </Typography>
                <Grid item md={12} xs={12}>
                  <>
                    Select a language (English/Español) (Por favor, escoge su idioma):
                  </><br/>
                  <LanguageSelector />
                  <hr/>
                  {noProgramSelected && formSubmitted && <p style={{ color: "rgb(244, 67, 54)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px"}}>
                      Please select an option below. If none apply, please select the None option.
                    </p>}
                  {questions.length !== 0 && (
                    <Questions register={register} errors={errors} questionClassName={styles.field} questions={questions}/>
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
                            value: /^\d{5}(>?-\d{4}){0,1}$/, message: 'Please enter a valid Zip Code'}
                        })}
                      />


                      </Grid>
                </Grid>
                <Grid item md={12} xs={12} container className={styles.right}>
                  <div className={!isSmall ? styles.sidebar : undefined}>
                    <br/>
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
                    {(hasErrors) && (
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
