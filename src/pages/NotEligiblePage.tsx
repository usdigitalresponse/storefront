import { Button, Grid, Typography, useTheme } from '@material-ui/core';
import { IAppState } from '../store/app';
import { IConfig } from '../common/types';
import { reverse } from '../common/router';
import { useContentImage } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import Content from '../components/Content';
import Link from '../components/Link';
import React from 'react';
import classNames from 'classnames';
import styles from './HomePage.module.scss';

interface Props {}

const HomePage: React.FC<Props> = () => {
  const isSmall = useIsSmall();
  const theme = useTheme();
  const primaryColor: any = theme.palette.primary;
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  const { embeddedViewName, embeddedViewEnabled, donationEnabled, ordersEnabled } = config;

  // const contentNotEligibleTitle = useContent('not_eligible_title');
  // const contentLocationOptionChange = useContent('checkout_location_option_change');
  // const contentLocationOptionChoose = useContent('checkout_location_option_choose');

  return (
    <BaseLayout padding={0} maxWidth="unset">
      <div style={{ margin: '0 auto', width: '80%', maxWidth: '1000px' }}>
        <Typography variant="h3" className={styles.title}>
          <Content id="not_eligible_title" defaultText="Not Eligibile Title" />
        </Typography>
        <br />
        <Typography variant="h5" className={styles.title}>
          <Content id="not_eligible_subtitle" defaultText="" />
        </Typography>
        <br />

        <Content id="not_eligible_copy" defaultText="Not Eligibile Copy" markdown />
      </div>
    </BaseLayout>
  );
};

export default HomePage;
