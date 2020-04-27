import { List, ListItem } from '@material-ui/core';
import { inventoryItemsSelector } from '../store/cms';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import Link from '../components/Link';
import React from 'react';
import styles from './ProductsPage.module.scss';

const ProductsPage: React.FC = () => {
  const inventory = useSelector(inventoryItemsSelector);

  return (
    <BaseLayout>
      <div className={styles.products}>
        <List>
          {inventory.map(item => (
            <ListItem key={item.id} component={Link} href={`/products/${item.id}`}>
              {item.itemName} ${item.price}
            </ListItem>
          ))}
        </List>
      </div>
    </BaseLayout>
  );
};

export default ProductsPage;
