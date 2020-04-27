import { Button } from '@material-ui/core';
import { reverse } from '../common/router';
import BaseLayout from '../layouts/BaseLayout';
import Link from '../components/Link';
import React from 'react';
import styles from './HomePage.module.scss';

interface Props {}

const HomePage: React.FC<Props> = () => {
  return (
    <BaseLayout>
      <div className={styles.home}>
        <div className={styles.hero}>Home</div>
        <Button size="large" color="primary" variant="outlined" component={Link} href={reverse('products')}>
          Get Started
        </Button>
      </div>
    </BaseLayout>
  );
};

export default HomePage;
