import { INavItem } from '../common/types';
import { reverse } from '../common/router';
import { useContent } from '../store/cms';
import { useMediaQuery } from '@material-ui/core';
import ContactUs from './Contact';
import Link from './Link';
import React from 'react';
import classNames from 'classnames';
import styles from './Footer.module.scss';
import theme from '../common/theme';

const Footer: React.FC = () => {
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const navPurchase = useContent('nav_purchase');
  const navDonate = useContent('nav_donate');
  const navDrive = useContent('nav_drive');
  const footerNavItems: INavItem[] = [
    { name: navPurchase, url: reverse('products') },
    { name: navDonate, url: reverse('donate') },
    { name: navDrive, url: reverse('drivers') },
    { name: 'Partner Login', url: 'https://airtable.com' },
  ];

  return (
    <div className={styles.footer}>
      <div className={classNames(styles.links, { [styles.small]: isSmall })}>
        {footerNavItems.map((item, index) => (
          <Link key={`${item.name}${index}`} href={item.url} className={styles.link}>
            {item.name}
          </Link>
        ))}
      </div>
      <ContactUs />
    </div>
  );
};

export default Footer;
