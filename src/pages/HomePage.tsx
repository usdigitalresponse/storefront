import { Button, Grid, Typography, useMediaQuery } from '@material-ui/core';
import { reverse } from '../common/router';
import { useCms } from '../store/cms';
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
  const pageTitle = useCms('page_title');

  return (
    <BaseLayout padding={0}>
      <div className={classNames(styles.home, { [styles.small]: isSmall })}>
        <Grid container justify="center" className={styles.hero}>
          <Grid item sm={8} xs={10} className={styles.heroContent}>
            <Typography variant="h1" className={styles.heroTitle}>
              <Interweave content={pageTitle} />
            </Typography>
            <Typography variant="body1" className={styles.heroDesc}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida
              dolor sit amet lacus accumsan et viverra justo commodo.
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
            </div>
          </Grid>
        </Grid>
        <Grid container justify="center" className={styles.section}>
          <Grid item sm={8} xs={10}>
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
        <Grid container justify="center" className={classNames(styles.section, styles.sectionImage)}>
          <Grid item sm={8} xs={10}>
            <Typography variant="h2" className={styles.sectionTitle}>
              Buy or Request Your Box Now
            </Typography>
            <Typography variant="body1" className={styles.sectionBody}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida
              dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque
              penatibus et magnis dis parturient montes,
            </Typography>
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
          </Grid>
        </Grid>
        <Grid container justify="center" className={styles.section}>
          <Grid item sm={4} xs={10}>
            <Typography variant="h2" className={styles.sectionTitle}>
              Make a donation
            </Typography>
            <Typography variant="body1" className={styles.sectionBody}>
              Short description goes here consider to show how to Waitlist in the description here.
            </Typography>
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
          </Grid>
          <Grid item sm={4} xs={10}>
            <Typography variant="h2" className={styles.sectionTitle}>
              Volunteer your time
            </Typography>
            <Typography variant="body1" className={styles.sectionBody}>
              Short description goes here about the deliver program. Lorem ipsum dolor sit amet, consectetur adipiscing
              elit.
            </Typography>
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
      </div>
    </BaseLayout>
  );
};

export default HomePage;
