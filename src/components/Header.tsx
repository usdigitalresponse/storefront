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
import { ICartItemCountSelector } from '../store/cart';
import { INavItem } from '../common/types';
import { reverse, routePaths } from '../common/router';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CartIcon from '@material-ui/icons/ShoppingCart';
import Content from './Content';
import Link from './Link';
import MenuIcon from '@material-ui/icons/Menu';
import React, { useState } from 'react';
import styles from './Header.module.scss';
import theme from '../common/theme';

export const headerNavItems: INavItem[] = [
  { name: 'Get Started', url: reverse('products') },
  { name: 'Drive for us', url: reverse('drivers') },
  // TODO: Create airtable view for wholesalers and update url
  { name: 'Partner Login', url: 'https://airtable.com' },
  // TODO: Create airtable view for drivers and update url
  { name: 'Driver Login', url: 'https://airtable.com' },
];

const Header: React.FC = () => {
  const isCheckout = useLocation().pathname === routePaths.checkout;
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const ICartItemsCount = useSelector<IAppState, number>(ICartItemCountSelector);

  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

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
              <List className={styles.drawerList}>
                {headerNavItems.map(item => (
                  <ListItem button component={'a'} key={item.name} href={item.url}>
                    <ListItemText primary={item.name} />
                  </ListItem>
                ))}
              </List>
            </Drawer>
          </>
        )}
        <Link href={reverse('home')} variant="h6" className={styles.title}>
          <Content id="page_title" />
        </Link>
        {!isSmall && !isCheckout && (
          <div>
            {headerNavItems.map(item => (
              <Link key={item.name} href={item.url} className={styles.headerLink}>
                {item.name}
              </Link>
            ))}
          </div>
        )}
        <IconButton edge="end" color="primary" component={Link} href={reverse('cart')}>
          <Badge badgeContent={ICartItemsCount} color="secondary" invisible={ICartItemsCount === 0}>
            <CartIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
