import { IAppState } from '../store/app';
import { Link, useMediaQuery } from '@material-ui/core';
import { cmsValueForKeySelector } from '../store/cms';
import { useSelector } from 'react-redux';
import Interweave from 'interweave';
import React from 'react';
import classNames from 'classnames';
import styles from './Contact.module.scss';
import theme from '../common/theme';

const Contact: React.FC = () => {
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const title = useSelector<IAppState, string>(cmsValueForKeySelector('contact_title'));
  const email = useSelector<IAppState, string>(cmsValueForKeySelector('contact_email'));
  const phone = useSelector<IAppState, string>(cmsValueForKeySelector('contact_phone'));

  return (
    <div className={classNames(styles.contact, { [styles.small]: isSmall })}>
      <span className={styles.title}>
        <Interweave content={title} />
        {!isSmall && ':'}
      </span>
      <Link href={`mailto:${email}`} className={styles.email}>
        <Interweave content={email} />
      </Link>
      <span className={styles.phone}>
        <Interweave content={phone} />
      </span>
    </div>
  );
};

export default Contact;
