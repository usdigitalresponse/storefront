import { IAppState } from '../store/app';
import { appIsReadySelector } from '../store/cms';
import { useMediaQuery } from '@material-ui/core';
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
}

const BaseLayout: React.FC<Props> = ({ children, title }) => {
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const appIsReady = useSelector<IAppState, boolean>(appIsReadySelector);

  return (
    <div className={styles.container}>
      <Header />
      <div className={classNames(styles.content, { [styles.small]: isSmall })}>
        {appIsReady ? (
          <>
            {title && <div className={styles.title}>{title}</div>}
            {children}
          </>
        ) : (
          <Loading />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BaseLayout;
