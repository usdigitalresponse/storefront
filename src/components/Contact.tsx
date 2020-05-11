import { Link } from '@material-ui/core';
import { useContent } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import Content from './Content';
import React from 'react';
import classNames from 'classnames';
import styles from './Contact.module.scss';

interface Props {
  className?: string;
  textClassName?: string;
}

const Contact: React.FC<Props> = ({ className, textClassName }) => {
  const isSmall = useIsSmall();
  const email = useContent('contact_email');

  return (
    <div className={classNames(styles.contact, className, { [styles.small]: isSmall })}>
      <span className={classNames(styles.title, textClassName)}>
        <Content id="contact_title" />
      </span>
      <Link href={`mailto:${email}`} className={classNames(styles.email, textClassName)}>
        <Content id="contact_email" />
      </Link>
      <span className={classNames(styles.phone, textClassName)}>
        <Content id="contact_phone" />
      </span>
    </div>
  );
};

export default Contact;
