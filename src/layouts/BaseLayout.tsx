import { Grid, Typography, useMediaQuery } from '@material-ui/core';
import { IAppState } from '../store/app';
import { appIsReadySelector } from '../store/cms';
import { useScrollToTop } from '../common/hooks';
import { useSelector } from 'react-redux';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Loading from '../components/Loading';
import React from 'react';
import classNames from 'classnames';
import styles from './BaseLayout.module.scss';
import theme from '../common/theme';

interface Props {
  title?: string;
  description?: string;
  padding?: number;
  maxWidth?: number;
}

const BaseLayout: React.FC<Props> = ({ children, title, description, padding, maxWidth }) => {
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const appIsReady = useSelector<IAppState, boolean>(appIsReadySelector);
  useScrollToTop();

  return (
    <div className={styles.container}>
      <Header />
      <Grid
        container
        className={classNames(styles.content, { [styles.small]: isSmall })}
        style={{ padding, maxWidth, alignSelf: maxWidth !== 0 ? 'center' : undefined }}
      >
        {appIsReady ? (
          <>
            {title && (
              <Grid item xs={12} className={styles.header}>
                <Typography className={styles.title} variant="h3">
                  {title}
                </Typography>
                {description && (
                  <Typography className={styles.description} variant="body1">
                    {description}
                  </Typography>
                )}
              </Grid>
            )}
            {children}
          </>
        ) : (
          <Loading />
        )}
      </Grid>
      <Footer />
    </div>
  );
};

export default BaseLayout;
