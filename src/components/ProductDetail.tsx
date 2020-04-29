import { Button, Card, Select, Typography } from '@material-ui/core';
import { InventoryRecord } from '../common/types';
import { formatCurrency } from '../common/format';
import { reverse } from '../common/router';
import { useIsSmall } from '../common/hooks';
import Link from './Link';
import React, { ChangeEvent, useState } from 'react';
import classNames from 'classnames';
import styles from './ProductDetail.module.scss';

interface Props {
  product: InventoryRecord;
}

const ProductDetail: React.FC<Props> = ({ product }) => {
  const isSmall = useIsSmall();
  const [quantity, setQuantity] = useState<number>(1);
  const { id, name, description, price } = product;

  function addToCart() {
    // to stuff
  }

  return (
    <Card raised className={classNames(styles.container, { [styles.small]: isSmall })}>
      <div className={styles.image} />
      <div className={styles.content}>
        <Typography variant="h4" className={styles.title}>
          {name}
        </Typography>
        <Typography variant="body1" className={styles.description}>
          {description}
        </Typography>
        <div className={styles.cta}>
          <div className={styles.ctaInfo}>
            <Typography variant="subtitle1" className={styles.ctaTitle}>
              Join the waitlist
            </Typography>
            <Typography variant="body2" className={styles.ctaTitle}>
              Once we recieve enough donations to reach your place on the waitlist, we'll arrange for the box to be
              delivered to you, free of charge.
            </Typography>
          </div>
          <div className={styles.ctaAction}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href={`${reverse('checkout')}?waitlist=true&item=${id}`}
            >
              Join Waitlist
            </Button>
          </div>
        </div>
        <div className={styles.cta}>
          <div className={styles.ctaInfo}>
            <Typography variant="subtitle1" className={styles.ctaTitle}>
              Purchase
            </Typography>
            <Typography variant="body2" className={styles.ctaTitle}>
              Pay online with a credit/debit card to have the box delivered. You must visit a pickup location if you
              intend to pay with EBT or cash.
            </Typography>
          </div>
          <div className={styles.ctaAction}>
            <Typography variant="h5" className={styles.price}>
              {formatCurrency(price)}
            </Typography>
            <Select
              native
              value={quantity}
              inputProps={{ name: 'quantity' }}
              onChange={(e: ChangeEvent<any>) => setQuantity(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(q => (
                <option key={q} selected value={q}>
                  {q}
                </option>
              ))}
            </Select>
            <Button variant="contained" color="primary" component={Link} onClick={addToCart}>
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductDetail;
