import {
  AppBar,
  Badge,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { IAppState } from '../store/app';
import { IConfig, INavItem } from '../common/types';
import { IOrderItemCountSelector } from '../store/cart';
import { reverse } from '../common/router';
import { useContent } from '../store/cms';
import { useIsSmall, usePrevious } from '../common/hooks';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CartIcon from '@material-ui/icons/ShoppingCart';
import Contact from './Contact';
import Content from './Content';
import LanguageSelector from './LanguageSelector';
import Link from './Link';
import MenuIcon from '@material-ui/icons/Menu';
import React, { useEffect, useState } from 'react';
import styles from './Header.module.scss';

const Header: React.FC = () => {
  const isSmall = useIsSmall();
  const isDonationRequest = useSelector<IAppState, boolean>((state) => state.checkout.isDonationRequest);
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);

  const { embeddedViewEnabled, embeddedViewName, donationEnabled, ordersEnabled, cartEnabled } = config;
  const IOrderItemsCount = useSelector<IAppState, number>(IOrderItemCountSelector);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const navPurchase = useContent('nav_purchase');
  const navDonate = useContent('nav_donate');
  const navLink = useContent('nav_link');
  const navDrive = useContent('nav_drive');

  const headerNavItems: INavItem[] = [{ name: 'Home', url: reverse('home') }];

  if (ordersEnabled) {
    headerNavItems.push({ name: navPurchase, url: reverse('products') });
  }

  if (donationEnabled) {
    headerNavItems.push({ name: navDonate, url: reverse('donate') });
  }

  if (embeddedViewEnabled) {
    headerNavItems.push({ name: navDrive, url: embeddedViewName ? `/${embeddedViewName}` : reverse('drivers') });
  }

  const location = useLocation();
  const prevLocation = usePrevious(location);

  useEffect(() => {
    if (location !== prevLocation) {
      setDrawerIsOpen(false);
    }
  }, [location, prevLocation]);

  return (
    <AppBar position="sticky" elevation={0} className={styles.header}>
      <Toolbar className={styles.toolbar}>
        {isSmall && (
          <>
            <IconButton
              edge="start"
              className={styles.menuButton}
              color="primary"
              onClick={() => setDrawerIsOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={drawerIsOpen} onClose={() => setDrawerIsOpen(false)}>
              <div className={styles.drawerContent}>
                <List>
                  <ListItem>
                    <Typography variant="h1" className={styles.drawerTitle}>
                      <Content id="header_title" />
                    </Typography>
                  </ListItem>
                  {headerNavItems.map((item, i) => (
                    <ListItem key={i} button component={Link} href={item.url}>
                      <ListItemText primary={item.name} />
                    </ListItem>
                  ))}
                  {navLink && (
                    <ListItem button>
                      <Content id="nav_link" markdown />
                    </ListItem>
                  )}
                </List>
                <Contact className={styles.contact} textClassName={styles.contactText} />
              </div>
            </Drawer>
          </>
        )}
        {!isSmall && (
          <Link href={reverse('home')} variant="h6" className={styles.title}>
            <Content id="header_title" />
          </Link>
        )}
        <div className={styles.right}>
          {!isSmall && (
            <>
              {headerNavItems.slice(1).map((item, i) => (
                <Link key={i} href={item.url} className={styles.headerLink}>
                  {item.name}
                </Link>
              ))}
              {navLink && (
                <div className={styles.headerLink}>
                  <Content id="nav_link" markdown />
                </div>
              )}
            </>
          )}
          {cartEnabled && (
            <IconButton
              edge="end"
              color="primary"
              component={Link}
              href={reverse(isDonationRequest ? 'checkout' : 'cart')}
            >
              <Badge badgeContent={IOrderItemsCount} color="secondary" invisible={IOrderItemsCount === 0}>
                <CartIcon />
              </Badge>
            </IconButton>
          )}
          <LanguageSelector className={styles.languageSelector} />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
