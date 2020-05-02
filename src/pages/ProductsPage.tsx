import { inventorySelector } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import ProductDetail from '../components/ProductDetail';
import React from 'react';
import classNames from 'classnames';
import styles from './ProductsPage.module.scss';

const ProductsPage: React.FC = () => {
  const inventory = useSelector(inventorySelector);
  const isSmall = useIsSmall();

  return (
    <BaseLayout
      title="Make a selection"
      description="Short into copy goes here call out need minimum 24 hours lead time of order, one delivery per week, how waitlist
        work, and where is the pickup locations. This can be wrap in multiple lines."
    >
      <div className={classNames(styles.container, { [styles.small]: isSmall })}>
        {inventory.map(item => (
          <ProductDetail key={item.id} product={item} className={styles.productDetail} />
        ))}
      </div>
    </BaseLayout>
  );
};

export default ProductsPage;
