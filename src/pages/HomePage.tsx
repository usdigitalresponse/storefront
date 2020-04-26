import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import styles from './HomePage.module.scss';

interface Props {}

const HomePage: React.FC<Props> = () => {
  return (
    <BaseLayout>
      <div className={styles.home}>Home</div>
    </BaseLayout>
  );
};

export default HomePage;
