import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { IAppState } from '../store/app';
import { ICartItem } from '../common/types';
import { SetDialogIsOpen } from '../store/cart';
import { useDispatch, useSelector } from 'react-redux';
import { useIsSmall } from '../common/hooks';
import CartItem from './CartItem';
import CheckIcon from '@material-ui/icons/Check';
import React from 'react';
import classNames from 'classnames';
import styles from './CartDialog.module.scss';

const CartDialog: React.FC = () => {
  const item = useSelector<IAppState, ICartItem>(state => state.cart.items[state.cart.items.length - 1]);
  const isOpen = useSelector<IAppState, boolean>(state => state.cart.dialogIsOpen);
  const isSmall = useIsSmall();
  const dispatch = useDispatch();

  function onClose() {
    dispatch(SetDialogIsOpen.create(false));
  }

  return item ? (
    <Dialog
      fullScreen={isSmall}
      open={isOpen}
      onClose={onClose}
      className={classNames(styles.dialog, { [styles.small]: isSmall })}
    >
      <DialogTitle className={styles.title}>
        <CheckIcon className={styles.titleIcon} /> Added to Cart
      </DialogTitle>
      <DialogContent className={styles.content}>
        <CartItem item={item} />
      </DialogContent>
      <DialogActions className={styles.footer}>
        <Button className={styles.actionButton} size="large" onClick={onClose} color="primary" variant="outlined">
          Continue Shopping
        </Button>
        <Button
          className={styles.actionButton}
          size="large"
          onClick={onClose}
          color="primary"
          variant="contained"
          autoFocus
        >
          View Cart &amp; Checkout
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;
};

export default CartDialog;
