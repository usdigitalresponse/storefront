import { inventoryItemsSelector } from '../store/cms';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import ProductDetail from '../components/ProductDetail';
import React from 'react';
import styles from './ProductsPage.module.scss';

const ProductsPage: React.FC = () => {
  const inventory = useSelector(inventoryItemsSelector);

  return (
    <BaseLayout>
      <div className={styles.products}>
        {inventory.map(item => (
          <ProductDetail key={item.id} product={item} />
        ))}
      </div>
    </BaseLayout>
  );
};

export default ProductsPage;
