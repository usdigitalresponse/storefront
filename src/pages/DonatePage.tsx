import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import StripeElementsWrapper from '../components/StripeElementsWrapper';
import styles from './DonatePage.module.scss';

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
