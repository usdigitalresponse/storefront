import { Button, Grid, Typography, useTheme } from '@material-ui/core';
import { IAppState } from '../store/app';
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
  const bannerImage = useContentImage('banner_image');
  const bannerLogo = useContentImage('banner_logo');
  const introImage = useContentImage('introduction_image');

  const embeddedViewEnabled = useSelector<IAppState, boolean>((state) => state.cms.config.embeddedViewEnabled);
  const donationEnabled = useSelector<IAppState, boolean>((state) => state.cms.config.donationEnabled);
  const embeddedViewName = useSelector<IAppState, string | undefined>((state) => state.cms.config.embeddedViewName);

  return (
    <BaseLayout padding={0} maxWidth="unset">
      <div className={classNames(styles.home, { [styles.small]: isSmall })}>
        <Grid
          container
          justify="center"
          className={classNames(styles.hero, { [styles.hasLogo]: !!bannerLogo })}
          style={{ backgroundImage: `url(${bannerImage.url})` }}
        >
          <Grid item container justify="flex-start" className={styles.content}>
            {bannerLogo && isSmall && (
              <Grid item md={6} xs={12} className={styles.logo}>
                <img src={bannerLogo.url} alt={bannerLogo.alt} className={styles.logoImg} />
              </Grid>
            )}
            <Grid item md={6} xs={12}>
              <Typography variant="h1" className={styles.heroTitle}>
                <Content id="banner_title" />
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
                {donationEnabled && (
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
                )}
                {embeddedViewEnabled && (
                  <Button
                    className={styles.ctaButton}
                    size="large"
                    color="primary"
                    variant="contained"
                    component={Link}
                    href={embeddedViewName ? `/${embeddedViewName}` : reverse('drivers')}
                  >
                    <Content id="drive_button_label" />
                  </Button>
                )}
              </div>
            </Grid>
            {bannerLogo && !isSmall && (
              <Grid item md={6} xs={12} className={styles.logo}>
                <img src={bannerLogo.url} alt={bannerLogo.alt} className={styles.logoImg} />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid container justify="center" className={styles.section}>
          <Grid item className={styles.content}>
            <Typography variant="h2" className={styles.sectionTitle}>
              <Content id="introduction_title" />
            </Typography>
            <Content id="introduction_copy" markdown />
            {introImage && <img src={introImage.url} alt={introImage.alt} className={styles.introImg} />}
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
            <Content id="purchase_copy" markdown allowParagraphs />
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
          <Grid item container justify="center" className={styles.content}>
            {donationEnabled && (
              <Grid item md={embeddedViewEnabled ? 6 : 12} xs={12} className={styles.sectionHalf}>
                <Typography variant="h2" className={styles.sectionTitle}>
                  <Content id="donate_title" />
                </Typography>
                <Content id="donate_copy" markdown allowParagraphs />
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
            )}
            {embeddedViewEnabled && (
              <Grid item md={donationEnabled ? 6 : 12} xs={12} className={styles.sectionHalf}>
                <Typography variant="h2" className={styles.sectionTitle}>
                  <Content id="drive_title" />
                </Typography>
                <Content id="drive_copy" markdown allowParagraphs />
                <Button
                  className={styles.ctaButton}
                  size="large"
                  color="primary"
                  variant="contained"
                  component={Link}
                  href={embeddedViewName ? `/${embeddedViewName}` : reverse('drivers')}
                >
                  <Content id="drive_button_label" />
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </div>
    </BaseLayout>
  );
};

export default HomePage;
