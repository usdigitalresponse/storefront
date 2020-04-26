import {
  AppBar,
  Badge,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { IAppState } from '../store/app';
import { INavItem } from '../common/types';
import { cartItemCountSelector } from '../store/cart';
import { cmsValueForKeySelector } from '../store/cms';
import { reverse } from '../common/rotuer';
import { useSelector } from 'react-redux';
import CartIcon from '@material-ui/icons/ShoppingCart';
import MenuIcon from '@material-ui/icons/Menu';
import React, { useState } from 'react';
import styles from './Header.module.scss';

export const navItems: INavItem[] = [
  { name: 'Get Started', url: reverse('products') },
  { name: 'Get Involved', url: reverse('drivers') },
  // TODO: Create airtable view for wholesalers and update url
  { name: 'Partner Login', url: 'https://airtable.com' },
  // TODO: Create airtable view for drivers and update url
  { name: 'Driver Login', url: 'https://airtable.com' },
];

const Header: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const pageTitle = useSelector<IAppState, string>(cmsValueForKeySelector('page_title'));
  const cartItemsCount = useSelector<IAppState, number>(cartItemCountSelector);

  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

  return (
    <AppBar position="static">
      <Toolbar>
        {isSmall && (
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
                {navItems.map(item => (
                  <ListItem button component="a" key={item.name} href={item.url}>
                    <ListItemText primary={item.name} />
                  </ListItem>
                ))}
              </List>
            </Drawer>
          </>
        )}
        <Typography variant="h6" className={styles.title}>
          {pageTitle}
        </Typography>
        {!isSmall && (
          <div className={styles.navItems}>
            {navItems.map(item => (
              <Button key={item.name} href={item.url} className={styles.headerLink}>
                {item.name}
              </Button>
            ))}
          </div>
        )}
        <IconButton edge="end" color="inherit" onClick={() => setDrawerIsOpen(true)}>
          <Badge badgeContent={cartItemsCount} color="secondary" invisible={cartItemsCount === 0}>
            <CartIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
