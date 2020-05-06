import { Checkbox, FormControlLabel, Grid, Typography } from '@material-ui/core';
import { ICheckoutFormDataDelivery } from '../common/types';
import { useIsSmall } from '../common/hooks';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './DeliveryPreferences.module.scss';

interface Props {
  inputRef: any;
  watch: any;
  setValue: (update: Array<Partial<ICheckoutFormDataDelivery>>) => void;
}

const DeliveryPreferences: React.FC<Props> = ({ inputRef, watch, setValue }) => {
  const isSmall = useIsSmall();
  const [anytime, setAnytime] = useState<boolean>(true);
  const values = watch([
    'deliveryPref_weekends',
    'deliveryPref_weekdays',
    'deliveryPref_mornings',
    'deliveryPref_afternoons',
    'deliveryPref_evenings',
  ]);

  const allFalse =
    !values.deliveryPref_afternoons &&
    !values.deliveryPref_evenings &&
    !values.deliveryPref_mornings &&
    !values.deliveryPref_weekdays &&
    !values.deliveryPref_weekends;

  useEffect(() => {
    if (allFalse) {
      setAnytime(true);
    } else {
      setAnytime(false);
    }
  }, [allFalse]);

  return (
    <Grid container className={classNames(styles.container, { [styles.small]: isSmall })}>
      <Grid item md={4} xs={12} className={styles.column}>
        <FormControlLabel
          className={styles.readOnly}
          control={<Checkbox color="primary" checked={anytime} onChange={(e) => setAnytime(e.target.checked)} />}
          label="Anytime"
          disabled={!allFalse}
        />
      </Grid>
      <Grid item md={4} xs={6} className={styles.column}>
        <FormControlLabel
          control={<Checkbox color="primary" inputRef={inputRef} name="deliveryPref_mornings" />}
          label="Mornings"
        />
        <FormControlLabel
          control={<Checkbox color="primary" inputRef={inputRef} name="deliveryPref_afternoons" />}
          label="Afternoons"
        />
        <FormControlLabel
          control={<Checkbox color="primary" inputRef={inputRef} name="deliveryPref_evenings" />}
          label="Evenings"
        />
      </Grid>
      <Grid item md={4} xs={6} className={styles.column}>
        <FormControlLabel
          control={<Checkbox color="primary" inputRef={inputRef} name="deliveryPref_weekends" />}
          label="Weekends"
        />
        <FormControlLabel
          control={<Checkbox color="primary" inputRef={inputRef} name="deliveryPref_weekdays" />}
          label="Weekdays"
        />
      </Grid>
      <Typography variant="body2" className={styles.note}>
        Delivery preferences are not guaranteed - we will make our best effort. Final delivery date and time will be
        confirmed by email.
      </Typography>
    </Grid>
  );
};

export default DeliveryPreferences;
