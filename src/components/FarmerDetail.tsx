import {
  AddItem,
  IOrderItemCountSelector,
  SetDialogIsOpen,
  SetItems,
  SetLocationPreferences,
  SetLocationsDialogIsOpen,
  SetSelectedLocation,
  itemsSelector,
} from '../store/cart';
import { Button, Card, Chip, Grid, Select, Tooltip, Typography } from '@material-ui/core';
import { CompoundAction } from 'redoodle';
import { Farmer, IConfig, ILocationPreference, IOrderItem, InventoryRecord } from '../common/types';
import { IAppState } from '../store/app';
import { SetIsDonationRequest } from '../store/checkout';
import { formatCurrency } from '../common/format';
import { getImageUrl } from '../common/utils';
import { reverse } from '../common/router';
import { useContent } from '../store/cms';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import Content from './Content';
import React, { ChangeEvent, useState } from 'react';
import classNames from 'classnames';
import qs from 'qs';
import styles from './FarmerDetail.module.scss';

interface Props {
  farmer: Farmer;
  card?: boolean;
  className?: string;
}

const FarmerDetail: React.FC<Props> = ({ card, farmer, className }) => {
  const isSmall = useIsSmall();
  const [short, setShort] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const dispatch = useDispatch();
  const { id, name, bio, state: stateName } = farmer;
  const history = useHistory();
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  const { paymentEnabled, waitlistEnabled, stockByLocation, singleCategoryCartEnabled } = config;
  const contentDisabledHelpText = useContent('disabled_add_cart_help_text');

  // If single category cart is enabled, we disable the Add to Cart button if the item's category
  // doesn't match the category of the first item in the cart

  return (
    <Card
      elevation={isSmall && card ? 2 : 0}
      raised={isSmall}
      className={classNames(styles.container, className, { [styles.small]: isSmall, [styles.large]: !isSmall })}
    >
      <div className={styles.imageContainer}>
        <img className={styles.image} src={getImageUrl(farmer.photo)} alt={farmer.name} />
      </div>
      <div className={styles.content}>
        <Typography variant="h4" className={styles.title}>
          {name}
        </Typography>
        <Typography variant="body1">
          <b>State:</b> {stateName}
        </Typography>
        <Typography
          variant="body1"
          className={classNames(styles.description, { [styles.short]: short })}
          onClick={() => setShort(!short)}
        >
          {bio}
        </Typography>
      </div>
    </Card>
  );
};

export default FarmerDetail;
