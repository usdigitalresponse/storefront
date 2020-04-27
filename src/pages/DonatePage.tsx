import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import styles from './DonatePage.module.scss';

const DonatePage: React.FC = () => {
  return (
    <BaseLayout title="Donate">
      <div className={styles.donate}>Donate Form</div>
    </BaseLayout>
  );
};

export default DonatePage;
