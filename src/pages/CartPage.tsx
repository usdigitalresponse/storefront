import { Grid } from '@material-ui/core';
import { IAppState } from '../store/app';
import { ICartItem } from '../common/types';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import OrderTypeSelector from '../components/OrderTypeSelector';
import React from 'react';
import classNames from 'classnames';
import styles from './CartPage.module.scss';

const CartPage: React.FC = () => {
  const isSmall = useIsSmall();
  const cartItems = useSelector<IAppState, ICartItem[]>(state => state.cart.items);

  return (
    <BaseLayout>
      <Grid container spacing={2} className={classNames(styles.container, { [styles.small]: isSmall })}>
        <Grid item sm={8} xs={12} container>
          <OrderTypeSelector />
          <div className={styles.cartItems}>
            {cartItems.map(item => (
              <CartItem key={item.id} item={item} editable className={styles.cartItem} />
            ))}
          </div>
        </Grid>
        <Grid item sm={4} xs={12} container>
          <OrderSummary className={isSmall ? styles.summary : undefined} />
        </Grid>
      </Grid>
    </BaseLayout>
  );
};

export default CartPage;
