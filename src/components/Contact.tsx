import { Link, useMediaQuery } from '@material-ui/core';
import { useContent } from '../store/cms';
import Content from './Content';
import React from 'react';
import classNames from 'classnames';
import styles from './Contact.module.scss';
import theme from '../common/theme';

const Contact: React.FC = () => {
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const email = useContent('contact_email');

  return (
    <div className={classNames(styles.contact, { [styles.small]: isSmall })}>
      <span className={styles.title}>
        <Content id="contact_title" />
        {!isSmall && ':'}
      </span>
      <Link href={`mailto:${email}`} className={styles.email}>
        <Content id="contact_email" />
      </Link>
      <span className={styles.phone}>
        <Content id="contact_phone" />
      </span>
    </div>
  );
};

export default Contact;
