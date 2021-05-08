import { Farmer } from '../common/types';
import { IAppState } from '../store/app';
import { farmerListSelector, useContent } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import Content from '../components/Content';
import FarmerDetail from '../components/FarmerDetail';
import React from 'react';
import classNames from 'classnames';
import styles from './FarmersPage.module.scss';

const FarmersPage: React.FC = () => {
  const farmerList = useSelector(farmerListSelector);
  const isSmall = useIsSmall();
  const title = useContent('farmers_page_title');
  const description = useContent('farmers_page_subtitle');

  const farmerListItems = (farmerList: Farmer[]) => {
    return (
      <div className={classNames(styles.container, { [styles.small]: isSmall })}>
        {farmerList.map((item) => (
          <FarmerDetail key={item.id} farmer={item} className={styles.farmerDetail} card={true} />
        ))}
      </div>
    );
  };

  return (
    <BaseLayout title={title} description={description}>
      <Content id="farmers_page_copy" />
      <div className={classNames(styles.container, { [styles.small]: isSmall })}>
        {farmerList?.length > 0 ? (
          <>{farmerListItems(farmerList)}</>
        ) : (
          <p>No Farmers have been entered into the system. Check back soon.</p>
        )}
      </div>
    </BaseLayout>
  );
};

export default FarmersPage;
