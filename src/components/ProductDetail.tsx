import { AddItem } from '../store/cart';
import { Button, Card, Grid, Select, Typography } from '@material-ui/core';
import { InventoryRecord } from '../common/types';
import { formatCurrency } from '../common/format';
import { getImageUrl } from '../common/utils';
import { reverse } from '../common/router';
import { useDispatch } from 'react-redux';
import { useIsSmall } from '../common/hooks';
import Link from './Link';
import React, { ChangeEvent, useState } from 'react';
import classNames from 'classnames';
import styles from './ProductDetail.module.scss';

interface Props {
  product: InventoryRecord;
  className?: string;
}

const ProductDetail: React.FC<Props> = ({ product, className }) => {
  const isSmall = useIsSmall();
  const [short, setShort] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const dispatch = useDispatch();
  const { id, name, description, price } = product;

  function addToCart() {
    dispatch(AddItem.create({ id: product.id, quantity }));
  }

  return (
    <Card elevation={2} className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      <div className={styles.image} style={{ backgroundImage: `url(${getImageUrl(product.image)})` }} />
      <div className={styles.content}>
        <Typography variant="h4" className={styles.title}>
          {name}
        </Typography>
        <Typography
          variant="body1"
          className={classNames(styles.description, { [styles.short]: short })}
          onClick={() => setShort(!short)}
        >
          {description}
        </Typography>
        <Grid container alignItems="center" className={styles.cta}>
          <Grid item sm={7} xs={12} className={styles.ctaInfo}>
            <Typography variant="subtitle1" className={styles.ctaTitle}>
              Join donation waitlist
            </Typography>
            <Typography variant="body2" className={styles.ctaDescription}>
              Can't pay for this yourself? Once we recieve enough donations, we'll arrange for the box to be delivered
              to you, free of charge.
            </Typography>
          </Grid>
          <Grid item sm={5} xs={12} className={styles.ctaAction}>
            <Button
              className={styles.ctaButton}
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              href={`${reverse('checkout')}?waitlist=true&item=${id}`}
            >
              Join Waitlist
            </Button>
          </Grid>
        </Grid>
        <Grid container alignItems="center" className={styles.cta}>
          <Grid item sm={7} xs={12} className={styles.ctaInfo}>
            <Typography variant="subtitle1" className={styles.ctaTitle}>
              Purchase
            </Typography>
            <Typography variant="body2" className={styles.ctaDescription}>
              Pay online with a credit/debit card to have the box delivered or visit a pickup location if you intend to
              pay with EBT or cash.
            </Typography>
          </Grid>
          <Grid item sm={5} xs={12} className={styles.ctaAction}>
            <div className={styles.ctaAccessories}>
              <Typography variant="h5" className={styles.price}>
                {formatCurrency(price)}
              </Typography>
              <Select
                native
                className={styles.quantity}
                color="primary"
                variant="outlined"
                value={quantity}
                inputProps={{ name: 'quantity' }}
                onChange={(e: ChangeEvent<any>) => setQuantity(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(q => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </Select>
            </div>
            <Button className={styles.ctaButton} variant="contained" color="primary" size="large" onClick={addToCart}>
              Add to cart
            </Button>
          </Grid>
        </Grid>
      </div>
    </Card>
  );
};

export default ProductDetail;
