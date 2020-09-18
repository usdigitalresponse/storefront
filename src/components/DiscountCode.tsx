import { AirtableService } from '../services/AirtableService';
import { CircularProgress, IconButton, InputAdornment, Link, TextField, useTheme } from '@material-ui/core';
import { IAppState } from '../store/app';
import { IConfig, IDiscountCode } from '../common/types';
import { SetDiscountCode, SetDiscountCodeMultiple } from '../store/checkout';
import { useDispatch, useSelector } from 'react-redux';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import Content from './Content';
import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './DiscountCode.module.scss';

interface Props {
  className?: string;
}

const DiscountCode: React.FC<Props> = ({ className }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [show, setShow] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const discountCodes = useSelector<IAppState, IDiscountCode[]>((state) => state.checkout.discountCodes);
  const lastAppliedDiscountCode = discountCodes.slice(-1)[0];
  const { sequentialDiscountCode } = useSelector<IAppState, IConfig>((state) => state.cms.config);

  async function onSubmit() {
    setLoading(true);

    if (discountCodes.map((discountCode: IDiscountCode) => discountCode.code).includes(code)) {
      setError('Code already used, please try another.');
    } else {
      const discountCode = await AirtableService.checkDiscountCode(code);

      if (discountCode) {
        // If this is a sequential discount code, allow multiple entries by adding to discountCodes array
        if (sequentialDiscountCode) {
          dispatch(SetDiscountCodeMultiple.create(discountCode));
        } else {
          dispatch(SetDiscountCode.create(discountCode));
        }

        setCode('');
      } else {
        setError('Invalid code, please try again.');
      }
    }

    setLoading(false);
  }

  return (
    <div className={classNames(styles.container, className)}>
      {!show && (
        <Link onClick={() => setShow(true)}>
          <Content id="discount_code_label" defaultText="I have a discount code" />
        </Link>
      )}
      {show && (
        <TextField
          fullWidth
          variant="outlined"
          label={<Content id="discount_code_field_label" defaultText="Discount Code" />}
          autoCapitalize="characters"
          value={code}
          error={!!error}
          className={styles.input}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              e.preventDefault();
              e.stopPropagation();
              onSubmit();
              return false;
            }
          }}
          helperText={error || (lastAppliedDiscountCode ? `Code ${lastAppliedDiscountCode.code} applied!` : undefined)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onSubmit}>
                  {!loading && <ArrowIcon htmlColor={error ? theme.palette.error.main : theme.palette.primary.main} />}
                  {loading && <CircularProgress size={20} color="primary" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}
    </div>
  );
};

export default DiscountCode;
