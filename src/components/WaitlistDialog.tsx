import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { SetWaitlistConfirmed, SetWaitlistDialogIsOpen } from '../store/checkout';
import { useDispatch, useSelector } from 'react-redux';
import { useIsSmall } from '../common/hooks';
import Content from './Content';
import React from 'react';
import classNames from 'classnames';
import styles from './WaitlistDialog.module.scss';

interface Props {
  onSubmit: () => void;
}

const WaitlistDialog: React.FC<Props> = ({ onSubmit }) => {
  const isOpen = useSelector<IAppState, boolean>((state) => state.checkout.waitlistDialogIsOpen);
  const isSmall = useIsSmall();
  const dispatch = useDispatch();

  function onClose() {
    dispatch(SetWaitlistDialogIsOpen.create(false));
  }

  function onConfirm() {
    dispatch(CompoundAction([SetWaitlistConfirmed.create(true), SetWaitlistDialogIsOpen.create(false)]));
    onSubmit();
  }

  return (
    <Dialog
      fullScreen={isSmall}
      open={isOpen}
      onClose={onClose}
      className={classNames(styles.dialog, { [styles.small]: isSmall })}
    >
      <DialogTitle className={styles.title}>Are you sure?</DialogTitle>
      <DialogContent className={styles.content}>
        <Typography variant="body1">
          <Content id="checkout_waitlist_dialog_copy" />
        </Typography>
      </DialogContent>
      <DialogActions className={styles.footer}>
        <Button
          className={styles.actionButton}
          size="large"
          onClick={onClose}
          color="primary"
          autoFocus
          variant="contained"
        >
          <Content id="checkout_waitlist_dialog_cancel_label" defaultText="Change my order" />
        </Button>
        <Button className={styles.actionButton} size="large" onClick={onConfirm} color="primary" variant="outlined">
          <Content id="checkout_waitlist_dialog_submit_label" defaultText="Add me to the waitlist" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WaitlistDialog;
