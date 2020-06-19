import { AddItem, SetDialogIsOpen, SetItems } from '../store/cart';
import { Button, Card, Grid, Select, Typography } from '@material-ui/core';
import { CompoundAction } from 'redoodle';
import { InventoryRecord } from '../common/types';
import { SetIsDonationRequest } from '../store/checkout';
import { formatCurrency } from '../common/format';
import { getImageUrl } from '../common/utils';
import { reverse } from '../common/router';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import Content from './Content';
import React, { ChangeEvent, useState } from 'react';
import classNames from 'classnames';
import styles from './ProductDetail.module.scss';

interface Props {
  product: InventoryRecord;
  card?: boolean;
  className?: string;
}

const ProductDetail: React.FC<Props> = ({ card, product, className }) => {
  const isSmall = useIsSmall();
  const [short, setShort] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const dispatch = useDispatch();
  const { id, name, description, price } = product;
  const history = useHistory();

  function addToCart() {
    dispatch(
      CompoundAction([
        AddItem.create({ id, quantity }),
        SetDialogIsOpen.create(true),
        SetIsDonationRequest.create(false),
      ]),
    );
  }

  function addToWaitlist() {
    dispatch(CompoundAction([SetItems.create([{ id, quantity: 1 }]), SetIsDonationRequest.create(true)]));
    history.push(reverse('checkout', { waitlist: true }));
  }

  return (
    <Card
      elevation={isSmall && card ? 2 : 0}
      raised={isSmall}
      className={classNames(styles.container, className, { [styles.small]: isSmall, [styles.large]: !isSmall })}
    >
      <img className={styles.image} src={getImageUrl(product.image)} alt={product.name} />
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
          <Grid item md={6} xs={12} className={styles.ctaInfo}>
            <Typography variant="subtitle1" className={styles.ctaTitle}>
              <Content id="products_waitlist_title" />
            </Typography>
            <Typography variant="body2" className={styles.ctaDescription}>
              <Content id="products_waitlist_copy" markdown />
            </Typography>
          </Grid>
          <Grid item md={6} xs={12} className={styles.ctaAction}>
            <Button
              className={styles.ctaButton}
              variant="outlined"
              color="primary"
              size="large"
              onClick={addToWaitlist}
            >
              <Content id="products_waitlist_button_label" />
            </Button>
          </Grid>
        </Grid>
        <Grid container alignItems="center" className={styles.cta}>
          <Grid item md={6} xs={12} className={styles.ctaInfo}>
            <Typography variant="subtitle1" className={styles.ctaTitle}>
              <Content id="products_purchase_title" />
            </Typography>
            <Typography variant="body2" className={styles.ctaDescription}>
              <Content id="products_purchase_copy" markdown />
            </Typography>
          </Grid>
          <Grid item md={6} xs={12} className={styles.ctaAction}>
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
                onChange={(e: ChangeEvent<any>) => setQuantity(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </Select>
            </div>
            <Button className={styles.ctaButton} variant="contained" color="primary" size="large" onClick={addToCart}>
              <Content id="products_purchase_button_label" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Card>
  );
};

export default ProductDetail;
