import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import styles from './DonatePage.module.scss';
import StripeElementsWrapper from '../components/StripeElementsWrapper';

const DonatePageMain: React.FC = () => {
  return (
    <BaseLayout title="Donate">
      <div className={styles.donate}>Donation Form</div>
    </BaseLayout>
  );
};

export default function DonatePage() {
  return (
    <StripeElementsWrapper type="donation">
      <DonatePageMain />
    </StripeElementsWrapper>
  );
}
