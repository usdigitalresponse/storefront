import { INavItem } from '../common/types';
import { reverse } from '../common/router';
import { useMediaQuery } from '@material-ui/core';
import ContactUs from './Contact';
import Link from './Link';
import React from 'react';
import classNames from 'classnames';
import styles from './Footer.module.scss';
import theme from '../common/theme';

const footerNavItems: INavItem[] = [
  { name: 'About us', url: reverse('about') },
  { name: 'Pickup Locations', url: reverse('drivers') },
  { name: 'Drive for us', url: reverse('drivers') },
  // TODO: Create airtable view for wholesalers and update url
  { name: 'Partner Login', url: 'https://airtable.com' },
  // TODO: Create airtable view for drivers and update url
  { name: 'Driver Login', url: 'https://airtable.com' },
];

const Footer: React.FC = () => {
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div className={styles.footer}>
      <div className={classNames(styles.links, { [styles.small]: isSmall })}>
        {footerNavItems.map(item => (
          <Link key={item.name} href={item.url} className={styles.link}>
            {item.name}
          </Link>
        ))}
      </div>
      <ContactUs />
    </div>
  );
};

export default Footer;
