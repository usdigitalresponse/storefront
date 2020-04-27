import { Button, Grid, Typography, useMediaQuery } from '@material-ui/core';
import { IAppState } from '../store/app';
import { cmsValueForKeySelector } from '../store/cms';
import { reverse } from '../common/router';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import Interweave from 'interweave';
import Link from '../components/Link';
import React from 'react';
import classNames from 'classnames';
import styles from './HomePage.module.scss';
import theme from '../common/theme';

interface Props {}

const HomePage: React.FC<Props> = () => {
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const pageTitle = useSelector<IAppState, string>(cmsValueForKeySelector('page_title'));

  return (
    <BaseLayout padding={0}>
      <div className={classNames(styles.home, { [styles.small]: isSmall })}>
        <Grid container justify="center" className={styles.hero}>
          <Grid item sm={6} xs={8} className={styles.heroContent}>
            <Typography variant="h1" className={styles.heroTitle}>
              <Interweave content={pageTitle} />
            </Typography>
            <Typography variant="body1" className={styles.heroDesc}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida
              dolor sit amet lacus accumsan et viverra justo commodo.
            </Typography>
            <Grid className={styles.cta}>
              <Button
                className={styles.ctaButton}
                size="large"
                color="primary"
                variant="contained"
                component={Link}
                href={reverse('products')}
              >
                Get Started
              </Button>
              <Button
                className={styles.ctaButton}
                size="large"
                color="primary"
                variant="contained"
                component={Link}
                href={reverse('donate')}
              >
                Donate
              </Button>
              <Button
                className={styles.ctaButton}
                size="large"
                color="primary"
                variant="contained"
                component={Link}
                href={reverse('drivers')}
              >
                Drive with us
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid container justify="center" className={styles.section}>
          <Grid item sm={6} xs={8}>
            <Typography variant="h2" className={styles.sectionTitle}>
              How does this work?
            </Typography>
            <Typography variant="body1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida
              dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque
              penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra
              vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.
            </Typography>
          </Grid>
        </Grid>
      </div>
    </BaseLayout>
  );
};

export default HomePage;
