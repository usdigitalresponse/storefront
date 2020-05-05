import { Button, Card, Grid, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { ICartItem } from '../common/types';
import { reverse } from '../common/router';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import CartItem from '../components/CartItem';
import Link from '../components/Link';
import OrderSummary from '../components/OrderSummary';
import OrderTypeSelector from '../components/OrderTypeSelector';
import React from 'react';
import classNames from 'classnames';
import styles from './CartPage.module.scss';

const CartPage: React.FC = () => {
  const isSmall = useIsSmall();
  const cartItems = useSelector<IAppState, ICartItem[]>(state => state.cart.items);

  return (
    <BaseLayout title="Shopping Cart">
      <Grid container spacing={2} className={classNames(styles.container, { [styles.small]: isSmall })}>
        <Grid item md={8} xs={12} container>
          <OrderTypeSelector />
          <Card elevation={2} className={styles.cartItems}>
            <Typography variant="h3" className={styles.cartItemsTitle}>
              Items
            </Typography>
            {cartItems.map((item, index) => (
              <CartItem key={item.id} item={item} index={index} editable className={styles.cartItem} />
            ))}
          </Card>
        </Grid>
        <Grid item md={4} xs={12} container className={styles.right}>
          <OrderSummary className={styles.summary} />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            href={reverse('checkout')}
          >
            Checkout
          </Button>
        </Grid>
      </Grid>
    </BaseLayout>
  );
};

export default CartPage;
