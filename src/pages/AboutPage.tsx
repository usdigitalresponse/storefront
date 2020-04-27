import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import styles from './AboutPage.module.scss';

const AboutPage: React.FC = () => {
  return (
    <BaseLayout title="About the program">
      <div className={styles.about}>Details about the program</div>
    </BaseLayout>
  );
};

export default AboutPage;
