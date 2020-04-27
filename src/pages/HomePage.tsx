import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import styles from './HomePage.module.scss';
import { useSelector } from 'react-redux';
import { getInventoryItems } from '../store/cms';
import { List, ListItem } from '@material-ui/core';

interface Props {}

const HomePage: React.FC<Props> = () => {
  const inventory = useSelector(getInventoryItems());

  if (!inventory.length) {
    return <BaseLayout>Loading...</BaseLayout>;
  }

  return (
    <BaseLayout>
      <div className={styles.home}>
        <List>
          {inventory.map((item) => (
            <ListItem key={item.id}>
              {item.itemName} ${item.price}
            </ListItem>
          ))}
        </List>
      </div>
    </BaseLayout>
  );
};

export default HomePage;
