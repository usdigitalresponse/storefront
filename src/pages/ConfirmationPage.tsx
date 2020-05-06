import { IAppState } from '../store/app';
import { IOrderSummary } from '../common/types';
import { useContent } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import classNames from 'classnames';
import styles from './ConfirmationPage.module.scss';

interface Props {}

const ConfirmationPage: React.FC<Props> = () => {
  const orderSummary = useSelector<IAppState, IOrderSummary>((state) => state.checkout.orderSummary!);
  const contact_phone = useContent('contact_phone');
  const isSmall = useIsSmall();

  if (!orderSummary) {
    return <BaseLayout title="Order not found" description={`Error finding order. Please try again`}></BaseLayout>;
  }
  return (
    <BaseLayout
      title="Order Placed!"
      description={`We've sent an email confirmation to ${orderSummary.email}. If you have any questions, we're here to help. Call ${contact_phone}`}
    >
      <div className={classNames(styles.container, { [styles.small]: isSmall })}>
        <div>Order Details</div>
        <div>Name: {orderSummary.fullName}</div>
        <div>Phone Number: {orderSummary.phone}</div>
        <div>Email: {orderSummary.email}</div>
      </div>
    </BaseLayout>
  );
};

export default ConfirmationPage;
