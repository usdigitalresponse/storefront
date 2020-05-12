import { Button, Grid, Typography, useTheme } from '@material-ui/core';
import { reverse } from '../common/router';
import { useContentImage } from '../store/cms';
import { useIsSmall } from '../common/hooks';
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
  const bannerImage = useContentImage('banner_image');

  return (
    <BaseLayout padding={0} maxWidth="unset">
      <div className={classNames(styles.home, { [styles.small]: isSmall })}>
        <Grid container justify="center" className={styles.hero} style={{ backgroundImage: `url(${bannerImage.url})` }}>
          <Grid item container justify="flex-start" className={styles.content}>
            <Grid item md={6} xs={12}>
              <Typography variant="h1" className={styles.heroTitle}>
                <Content id="page_title" />
              </Typography>
              <Typography variant="body1" className={styles.heroDescription}>
                <Content id="banner_copy" />
              </Typography>
              <div className={styles.cta}>
                <Button
                  className={styles.ctaButton}
                  size="large"
                  color="primary"
                  variant="contained"
                  component={Link}
                  href={reverse('products')}
                >
                  <Content id="purchase_button_label" />
                </Button>
                <Button
                  className={styles.ctaButton}
                  size="large"
                  color="primary"
                  variant="contained"
                  component={Link}
                  href={reverse('donate')}
                >
                  <Content id="donate_button_label" />
                </Button>
                <Button
                  className={styles.ctaButton}
                  size="large"
                  color="primary"
                  variant="contained"
                  component={Link}
                  href={reverse('drivers')}
                >
                  <Content id="drive_button_label" />
                </Button>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid container justify="center" className={styles.section}>
          <Grid item className={styles.content}>
            <Typography variant="h2" className={styles.sectionTitle}>
              <Content id="introduction_title" />
            </Typography>
            <Typography variant="body1">
              <Content id="introduction_copy" markdown />
            </Typography>
          </Grid>
        </Grid>
        <Grid
          container
          justify="center"
          className={classNames(styles.section, styles.sectionImage)}
          style={{ backgroundColor: `${primaryColor[50]}80` }}
        >
          <Grid item className={styles.content}>
            <Typography variant="h2" className={styles.sectionTitle}>
              <Content id="purchase_title" />
            </Typography>
            <Typography variant="body1" className={styles.sectionBody}>
              <Content id="purchase_copy" markdown />
            </Typography>
            <Button
              className={styles.ctaButton}
              size="large"
              color="primary"
              variant="contained"
              component={Link}
              href={reverse('products')}
            >
              <Content id="purchase_button_label" />
            </Button>
          </Grid>
        </Grid>
        <Grid container justify="center" className={styles.section}>
          <Grid item container spacing={4} justify="center" className={styles.content}>
            <Grid item md={6} xs={12} className={styles.sectionHalf}>
              <Typography variant="h2" className={styles.sectionTitle}>
                <Content id="donate_title" />
              </Typography>
              <Typography variant="body1" className={styles.sectionBody}>
                <Content id="donate_copy" markdown />
              </Typography>
              <Button
                className={styles.ctaButton}
                size="large"
                color="primary"
                variant="contained"
                component={Link}
                href={reverse('donate')}
              >
                <Content id="donate_button_label" />
              </Button>
            </Grid>
            <Grid item md={6} xs={12} className={styles.sectionHalf}>
              <Typography variant="h2" className={styles.sectionTitle}>
                <Content id="drive_title" />
              </Typography>
              <Typography variant="body1" className={styles.sectionBody}>
                <Content id="drive_copy" markdown />
              </Typography>
              <Button
                className={styles.ctaButton}
                size="large"
                color="primary"
                variant="contained"
                component={Link}
                href={reverse('drivers')}
              >
                <Content id="drive_button_label" />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </BaseLayout>
  );
};

export default HomePage;
