import { IAppState } from '../store/app';
import { Link, useMediaQuery } from '@material-ui/core';
import { cmsValueForKeySelector } from '../store/cms';
import { useSelector } from 'react-redux';
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
    <div className={styles.contact}>
      <span className={styles.title}>{title}</span>
      <div className={classNames(styles.info, { [styles.small]: isSmall })}>
        <Link href={`mailto:${email}`} className={styles.email}>
          {email}
        </Link>
        <span className={styles.phone}>{phone}</span>
      </div>
    </div>
  );
};

export default Contact;
