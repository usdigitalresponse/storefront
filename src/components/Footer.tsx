import { IAppState } from '../store/app';
import { IConfig, INavItem } from '../common/types';
import { reverse } from '../common/router';
import { useContent } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import { useTheme } from '@material-ui/core';
import ContactUs from './Contact';
import Content from './Content';
import Link from './Link';
import React from 'react';
import classNames from 'classnames';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
  const isSmall = useIsSmall();
  const theme = useTheme();
  const primaryColor: any = theme.palette.primary;
  const navPurchase = useContent('nav_purchase');
  const navDonate = useContent('nav_donate');
  const navDrive = useContent('nav_drive');
  const navLink = useContent('nav_link');
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  const { driverForm, driverFormName, donationEnabled } = config;
  const footerNavItems: INavItem[] = [{ name: navPurchase, url: reverse('products') }];

  if (donationEnabled) {
    footerNavItems.push({ name: navDonate, url: reverse('donate') });
  }

  if (driverForm) {
    footerNavItems.push({ name: navDrive, url: driverFormName ? `/${driverFormName}` : reverse('drivers') });
  }

  footerNavItems.push({ name: 'Partner Login', url: 'https://airtable.com' });

  return (
    <div className={styles.footer} style={{ backgroundColor: `${primaryColor[50]}80` }}>
      <div className={classNames(styles.links, { [styles.small]: isSmall })}>
        {footerNavItems.map((item, index) => (
          <Link key={`${item.name}${index}`} href={item.url} className={styles.link}>
            {item.name}
          </Link>
        ))}
        {navLink && (
          <div className={styles.link}>
            <Content id="nav_link" markdown />
          </div>
        )}
      </div>
      <ContactUs />
    </div>
  );
};

export default Footer;
