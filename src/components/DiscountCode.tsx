import { AirtableService } from '../services/AirtableService';
import { CircularProgress, IconButton, InputAdornment, Link, TextField, useTheme } from '@material-ui/core';
import { IAppState } from '../store/app';
import { IDiscountCode } from '../common/types';
import { SetDiscountCode } from '../store/checkout';
import { useDispatch, useSelector } from 'react-redux';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './DiscountCode.module.scss';
import Content from "./Content";

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
  const discountCode = useSelector<IAppState, IDiscountCode | undefined>((state) => state.checkout.discountCode);

  async function onSubmit() {
    setLoading(true);
    const discountCode = await AirtableService.checkDiscountCode(code);

    if (discountCode) {
      dispatch(SetDiscountCode.create(discountCode));
      setCode('');
    } else {
      setError('Invalid code, please try again.');
    }

    setLoading(false);
  }

  return (
    <div className={classNames(styles.container, className)}>
      {!show && <Link onClick={() => setShow(true)}>
        <Content id="discount_code_label" defaultText="I have a discount code"/>
      </Link>}
      {show && (
        <TextField
          fullWidth
          variant="outlined"
          label="Discount Code"
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
          helperText={error || (discountCode ? `Discount code ${discountCode.code} applied!` : undefined)}
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
