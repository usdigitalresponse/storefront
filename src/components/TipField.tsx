import { Button, ButtonGroup, InputAdornment, TextField, useTheme } from '@material-ui/core';
import { IAppState } from '../store/app';
import { SetTipPercentage } from '../store/checkout';
import { useDispatch, useSelector } from 'react-redux';
import { useIsSmall } from '../common/hooks';
import React, { ChangeEvent, useCallback, useState } from 'react';
import classNames from 'classnames';
import styles from './TipField.module.scss';

const TipField: React.FC = () => {
  const tipPercentage = useSelector<IAppState, number>((state) => state.checkout.tipPercentage);
  const dispatch = useDispatch();
  const presets = [20, 15, 10, 0];
  const [other, setOther] = useState<string>('');
  const theme = useTheme();
  const isSmall = useIsSmall();

  const updateToPreset = useCallback(
    (amount: number) => {
      setOther('');
      dispatch(SetTipPercentage.create(amount));
    },
    [dispatch],
  );

  const updateOther = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setOther(value);

      const numericalValue = parseInt(value);
      if (isNaN(numericalValue) || numericalValue < 0) {
        dispatch(SetTipPercentage.create(presets[0]));
      } else {
        dispatch(SetTipPercentage.create(numericalValue));
      }
    },
    [dispatch, presets],
  );

  return (
    <div className={classNames(styles.container, { [styles.small]: isSmall })}>
      <ButtonGroup fullWidth={isSmall}>
        {presets.map((amount: number, index: number) => {
          const isSelected = amount === tipPercentage;
          return (
            <Button
              key={`${amount}-${index}`}
              className={styles.amountButton}
              variant="outlined"
              size="large"
              color="primary"
              style={{
                backgroundColor: isSelected ? theme.palette.primary.main : undefined,
                color: isSelected ? 'white' : undefined,
              }}
              onClick={() => updateToPreset(amount)}
            >
              {amount}%
            </Button>
          );
        })}
      </ButtonGroup>
      <TextField
        fullWidth
        value={other}
        onChange={updateOther}
        className={styles.otherAmount}
        variant="outlined"
        label="Other"
        name="otherPercentage"
        inputProps={{ maxLength: 2 }}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
        }}
      />
    </div>
  );
};

export default TipField;
