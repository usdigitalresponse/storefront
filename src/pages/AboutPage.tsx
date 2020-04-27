import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import styles from './AboutPage.module.scss';

const AboutPage: React.FC = () => {
  return (
    <BaseLayout>
      <div className={styles.about}>About</div>
    </BaseLayout>
  );
};

export default AboutPage;
