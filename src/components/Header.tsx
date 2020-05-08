import {
  AppBar,
  Badge,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  useMediaQuery,
} from '@material-ui/core';
import { IAppState } from '../store/app';
import { INavItem } from '../common/types';
import { IOrderItemCountSelector } from '../store/cart';
import { reverse, routePaths } from '../common/router';
import { useLocation } from 'react-router-dom';
import { usePrevious } from '../common/hooks';
import { useSelector } from 'react-redux';
import CartIcon from '@material-ui/icons/ShoppingCart';
import Contact from './Contact';
import Content from './Content';
import Link from './Link';
import MenuIcon from '@material-ui/icons/Menu';
import React, { useEffect, useState } from 'react';
import styles from './Header.module.scss';
import theme from '../common/theme';

export const headerNavItems: INavItem[] = [
  { name: 'Home', url: reverse('home') },
  { name: 'Purchase Food', url: reverse('products') },
  { name: 'Donate Now', url: reverse('donate') },
  { name: 'Drive for us', url: reverse('drivers') },
];

const Header: React.FC = () => {
  const isCheckout = useLocation().pathname === routePaths.checkout;
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isDonationRequest = useSelector<IAppState, boolean>((state) => state.checkout.isDonationRequest);
  const IOrderItemsCount = useSelector<IAppState, number>(IOrderItemCountSelector);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

  const location = useLocation();
  const prevLocation = usePrevious(location);

  useEffect(() => {
    if (location !== prevLocation) {
      setDrawerIsOpen(false);
    }
  }, [location, prevLocation]);

  return (
    <AppBar position="sticky" elevation={0} className={styles.header}>
      <Toolbar>
        {isSmall && !isCheckout && (
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
                  {headerNavItems.map((item) => (
                    <ListItem key={item.name} button component={Link} href={item.url}>
                      <ListItemText primary={item.name} />
                    </ListItem>
                  ))}
                </List>
                <Contact className={styles.contact} textClassName={styles.contactText} />
              </div>
            </Drawer>
          </>
        )}
        <Link href={reverse('home')} variant="h6" className={styles.title}>
          <Content id="page_title" />
        </Link>
        {!isSmall && !isCheckout && (
          <div>
            {headerNavItems.slice(1).map((item) => (
              <Link key={item.name} href={item.url} className={styles.headerLink}>
                {item.name}
              </Link>
            ))}
          </div>
        )}
        <IconButton edge="end" color="primary" component={Link} href={reverse(isDonationRequest ? 'checkout' : 'cart')}>
          <Badge badgeContent={IOrderItemsCount} color="secondary" invisible={IOrderItemsCount === 0}>
            <CartIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
