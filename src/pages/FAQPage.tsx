import { Typography } from '@material-ui/core';
import BaseLayout from '../layouts/BaseLayout';
import Content from '../components/Content';
import React from 'react';
import styles from './HomePage.module.scss';

interface Props {}

const FAQPage: React.FC<Props> = () => {
  return (
    <BaseLayout padding={0} maxWidth="unset">
      <div style={{ margin: '0 auto', width: '80%', maxWidth: '1000px' }}>
        <Typography variant="h3" className={styles.title}>
          <Content id="faq_title" defaultText="Add faq_title in the CMS Content" markdown />
        </Typography>
        <br />
        <Typography variant="h5" className={styles.title}>
          <Content id="faq_subtitle" defaultText="Add faq_subtitle in the CMS Content" markdown />
        </Typography>
        <br />

        <Content id="faq_copy" defaultText="Add faq_copy in the CMS Content" markdown />
      </div>
    </BaseLayout>
  );
};

export default FAQPage;
