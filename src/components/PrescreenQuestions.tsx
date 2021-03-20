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


import { CheckoutFormField, IConfig, IOrderItem, IPrescreenFormData } from '../common/types';
import { IAppState } from '../store/app';
import { itemsSelector } from '../store/cart';
import { reverse } from '../common/router';
import { useContent } from '../store/cms';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';

import Content from './Content';
import React from 'react';
import classNames from 'classnames';
import styles from './PrescreenQuestions.module.scss';

interface Props {
  className?: string;
  textClassName?: string;
}

const PrescreenQuestions: React.FC<Props> = ({ className, textClassName }) => {
  const { register, watch, handleSubmit, errors, clearError } = useForm<IPrescreenFormData>();
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  const hasErrors = Object.keys(errors).length > 0;
  const history = useHistory();


  // Content
  const contentPayNowOptionLabel = useContent('pay_now_option_label');
  const contentPayLaterOptionLabel = useContent('pay_later_option_label');
  const contentFieldIsRequired = useContent('checkout_field_is_required');
  const contentFieldName = useContent('checkout_field_name');
  const contentFieldNameFirstLast = useContent('checkout_field_name_first_last');
  const contentFieldNameFirstLastRequired = useContent('checkout_field_name_first_last_required');
  const contentFieldPhoneNumber = useContent('checkout_field_phone_number');
  const contentFieldEmail = useContent('checkout_field_email');
  const contentFieldAddressStreet1 = useContent('checkout_field_address_street_1');
  const contentFieldAddressStreet2 = useContent('checkout_field_address_street_2');
  const contentFieldAddressCity = useContent('checkout_field_address_city');
  const contentFieldAddressState = useContent('checkout_field_address_state');
  const contentFieldAddressZipcode = useContent('checkout_field_address_zipcode');
  const contentLocationOptionChange = useContent('checkout_location_option_change');
  const contentLocationOptionChoose = useContent('checkout_location_option_choose');

  const isSmall = useIsSmall();


  async function onSubmit(data: IPrescreenFormData) {
    //dispatch(CompoundAction([SetIsPaying.create(true), SetError.create(undefined)]));

    const status = "Continue";
    if (status === "Continue") {
      history.push(reverse('checkout'));
    }
  }

  function textFieldProps(label: string, name: CheckoutFormField, placeholder?: string): TextFieldProps {
    //const error = errors[name];
    const error = {message: "Test error"}

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

  const disableSubmit = hasErrors //|| !items.length;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={classNames(styles.container, { [styles.small]: isSmall })}>
        <Grid container spacing={2}>
          <Grid item md={8} xs={12}>
            <Card elevation={2} className={styles.form}>
              <Grid container className={styles.section}>
                <Typography variant="h3" className={styles.title}>
                  <Content id="checkout_personal_info_header" defaultText="Questionare" />
                </Typography>
                <Grid item md={8} xs={12}>
                  <TextField
                    {...textFieldProps(
                      contentFieldName || 'Zip',
                      'zip',
                      contentFieldNameFirstLast || 'Zip',
                    )}
                    inputRef={register({
                      required: contentFieldIsRequired || 'Zip is required',
                      pattern: {
                        value: /[\w-']+ [\w-'][\w-']+/,
                        message: contentFieldNameFirstLastRequired || 'Zip required',
                      },
                    })}
                    autoCorrect="off"
                  />
                  {/* <TextField
                    {...textFieldProps(contentFieldPhoneNumber || 'Phone Number', 'phone')}
                    type="tel"
                    inputRef={register({ required: contentFieldIsRequired || 'Phone Number is required' })}
                    InputProps={{ inputComponent: PhoneField }}
                  />
                  <TextField
                    {...textFieldProps(contentFieldEmail || 'Email', 'email', 'name@domain.com')}
                    type="email"
                    inputRef={register({ required: contentFieldIsRequired || 'Email is required' })}
                  />
                  {questions.length !== 0 && (
                    <Questions register={register} errors={errors} questionClassName={styles.field} />
                  )}
                  {!isDonationRequest && <OptInView className={styles.optIn} inputRef={register} />}
                  {isDonationRequest && (
                    <ConfirmEligibilityView
                      className={styles.optIn}
                      inputRef={register({ required: requiresEligibility ? 'Eligiblity required' : false })}
                      errors={errors}
                    />
                  )} */}
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
