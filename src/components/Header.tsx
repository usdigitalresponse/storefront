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
import { cmsValueForKeySelector } from '../store/cms';
import { reverse, routePaths } from '../common/router';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CartIcon from '@material-ui/icons/ShoppingCart';
import Interweave from 'interweave';
import Link from './Link';
import MenuIcon from '@material-ui/icons/Menu';
import React, { useState } from 'react';
import styles from './Header.module.scss';
import theme from '../common/theme';

export const headerNavItems: INavItem[] = [
  { name: 'Get Started', url: reverse('products') },
  { name: 'Get Involved', url: reverse('drivers') },
  // TODO: Create airtable view for wholesalers and update url
  { name: 'Partner Login', url: 'https://airtable.com' },
  // TODO: Create airtable view for drivers and update url
  { name: 'Driver Login', url: 'https://airtable.com' },
];

const Header: React.FC = () => {
  const isCheckout = useLocation().pathname === routePaths.checkout;
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const pageTitle = useSelector<IAppState, string>(cmsValueForKeySelector('page_title'));
  const ICartItemsCount = useSelector<IAppState, number>(ICartItemCountSelector);

  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

  return (
    <AppBar position="static">
      <Toolbar>
        {isSmall && !isCheckout && (
          <>
            <IconButton
              edge="start"
              className={styles.menuButton}
              color="inherit"
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
          <Interweave content={pageTitle} />
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
        <IconButton edge="end" color="inherit" component={Link} href={reverse('cart')}>
          <Badge badgeContent={ICartItemsCount} color="secondary" invisible={ICartItemsCount === 0}>
            <CartIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
