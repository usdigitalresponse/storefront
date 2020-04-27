import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import styles from './DriversPage.module.scss';

const DriversPage: React.FC = () => {
  return (
    <BaseLayout title="Volunteer to be a Driver">
      <div className={styles.donate}>Driver Signup Form</div>
    </BaseLayout>
  );
};

export default DriversPage;
