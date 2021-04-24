import { Grid, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { appIsReadySelector, useContent } from '../store/cms';
import { useIsSmall, useScrollToTop } from '../common/hooks';
import { useSelector } from 'react-redux';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
import styles from './BaseLayout.module.scss';

interface Props {
  title?: string;
  description?: string | ReactNode;
  padding?: number;
  maxWidth?: number | 'unset';
}

const BaseLayout: React.FC<Props> = ({ children, title, description, padding, maxWidth }) => {
  useScrollToTop();
  const isSmall = useIsSmall();
  const appIsReady = useSelector<IAppState, boolean>(appIsReadySelector);
  document.title = useContent('page_title') || "Storefront";

  return (
    <div className={styles.container}>
      <Grid
        container
        className={classNames(styles.content, { [styles.small]: isSmall })}
        style={{
          padding,
          maxWidth,
          alignSelf: maxWidth !== 'unset' ? 'center' : undefined,
        }}
      >
        {appIsReady ? (
          <>
            {title && (
              <Grid item xs={12} className={styles.header}>
                <Typography className={classNames(styles.title, { [styles.hasDescription]: description })} variant="h3">
                  {title}
                </Typography>
                {description && typeof description === 'string' && (
                  <Typography className={styles.description} variant="body1">
                    <ReactMarkdown unwrapDisallowed disallowedTypes={['paragraph']} source={description} />
                  </Typography>
                )}
                {description && typeof description !== 'string' && description}
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
