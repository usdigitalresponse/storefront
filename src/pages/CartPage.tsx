import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import styles from './CartPage.module.scss';

interface Props {}

const CartPage: React.FC<Props> = () => {
  return (
    <BaseLayout>
      <div className={styles.cart}>Shopping Cart</div>
    </BaseLayout>
  );
};

export default CartPage;
