import { AddItem, IOrderItemCountSelector, SetDialogIsOpen, SetItems, itemsSelector } from '../store/cart';
import { Button, Card, Chip, Grid, Select, Tooltip, Typography } from '@material-ui/core';
import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { IConfig, IOrderItem, InventoryRecord } from '../common/types';
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
import styles from './ProductDetail.module.scss';

interface Props {
  product: InventoryRecord;
  card?: boolean;
  className?: string;
}

const ProductDetail: React.FC<Props> = ({ card, product, className }) => {
  const isSmall = useIsSmall();
  const [short, setShort] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const dispatch = useDispatch();
  const { id, category, name, description, price, locations, addOn } = product;
  const history = useHistory();
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  const { paymentEnabled, waitlistEnabled, stockByLocation, singleCategoryCartEnabled } = config;
  const orderItemCount = useSelector<IAppState, number>(IOrderItemCountSelector);
  const cartItems = useSelector<IAppState, IOrderItem[]>(itemsSelector);
  const contentDisabledHelpText = useContent('disabled_add_cart_help_text');

  function addToCart() {
    dispatch(
      CompoundAction([
        AddItem.create({ addOn, category, id, quantity }),
        SetDialogIsOpen.create(true),
        SetIsDonationRequest.create(false),
      ]),
    );
  }

  function addToWaitlist() {
    dispatch(CompoundAction([SetItems.create([{ id, quantity: 1 }]), SetIsDonationRequest.create(true)]));
    history.push(reverse('checkout', { waitlist: true }));
  }

  const addOnShouldDisable = orderItemCount === 0 && addOn;

  // If single category cart is enabled, we disable the Add to Cart button if the item's category
  // doesn't match the category of the first item in the cart
  const singleCategoryShouldDisable =
    singleCategoryCartEnabled &&
    orderItemCount > 0 &&
    // Either category is the string 'no_category', an empty array, or array with a single item
    category.toString() !== (cartItems[0].category && cartItems[0].category.toString());

  const shouldDisableAddToChart = addOnShouldDisable || singleCategoryShouldDisable;

  let disabledHelpText = '';
  if (addOnShouldDisable) {
    disabledHelpText = 'This is an add-on item. Add another item to your cart to include this item';
  } else if (singleCategoryShouldDisable) {
    disabledHelpText = contentDisabledHelpText || 'You can only add items from a single category';
  }

  return (
    <Card
      elevation={isSmall && card ? 2 : 0}
      raised={isSmall}
      className={classNames(styles.container, className, { [styles.small]: isSmall, [styles.large]: !isSmall })}
    >
      <div className={styles.imageContainer}>
        <img className={styles.image} src={getImageUrl(product.image)} alt={product.name} />
      </div>
      <div className={styles.content}>
        <Typography variant="h4" className={styles.title}>
          {name}
          {addOn && <Chip size="small" variant="outlined" label="Add-On Item" className={styles.addon} />}
        </Typography>
        <Typography
          variant="body1"
          className={classNames(styles.description, { [styles.short]: short })}
          onClick={() => setShort(!short)}
        >
          {description}
        </Typography>
        {paymentEnabled && (
          <Grid container alignItems="center" className={styles.cta}>
            <Grid item md={6} xs={12} className={styles.ctaInfo}>
              <Typography variant="subtitle1" className={styles.ctaTitle}>
                <Content id="products_purchase_title" />
              </Typography>
              <Typography variant="body2" className={styles.ctaDescription}>
                <Content id="products_purchase_copy" markdown />
              </Typography>
            </Grid>
            <Grid item md={6} xs={12} className={styles.ctaAction}>
              <div className={styles.ctaAccessories}>
                <Typography variant="h5" className={styles.price}>
                  {formatCurrency(price)}
                </Typography>
                <Select
                  native
                  className={styles.quantity}
                  color="primary"
                  variant="outlined"
                  value={quantity}
                  inputProps={{ name: 'quantity' }}
                  onChange={(e: ChangeEvent<any>) => setQuantity(parseInt(e.target.value))}
                  disabled={shouldDisableAddToChart}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </Select>
              </div>
              <Tooltip title={disabledHelpText}>
                <span>
                  {/* Tooltips don't appear if their immediate child is disabled, so this is wrapped in a <span> as buffer */}
                  <Button
                    className={styles.ctaButton}
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={addToCart}
                    disabled={shouldDisableAddToChart}
                  >
                    <Content id="products_purchase_button_label" />
                  </Button>
                </span>
              </Tooltip>
            </Grid>
          </Grid>
        )}
        {waitlistEnabled && (
          <Grid container alignItems="center" className={styles.cta}>
            <Grid item md={6} xs={12} className={styles.ctaInfo}>
              <Typography variant="subtitle1" className={styles.ctaTitle}>
                <Content id="products_waitlist_title" />
              </Typography>
              <Typography variant="body2" className={styles.ctaDescription}>
                <Content id="products_waitlist_copy" markdown />
              </Typography>
              {stockByLocation && locations && (
                <div className={styles.locations}>
                  <Typography variant="body2">Available in the following locations:</Typography>
                  <ul className={styles.locationList}>
                    {locations.map((location) => (
                      <Typography key={location.id} component="li" variant="body2" className={classNames()}>
                        <span className={classNames({ [styles.soldout]: location.stockRemaining === 0 })}>
                          {location.name}
                        </span>
                        {location.stockRemaining === 0 && <span>Sold Out - Waitlist Only</span>}
                      </Typography>
                    ))}
                  </ul>
                </div>
              )}
            </Grid>
            <Grid item md={6} xs={12} className={styles.ctaAction}>
              <Button
                className={styles.ctaButton}
                variant={paymentEnabled ? 'outlined' : 'contained'}
                color="primary"
                size="large"
                onClick={addToWaitlist}
              >
                <Content id="products_waitlist_button_label" />
              </Button>
            </Grid>
          </Grid>
        )}
      </div>
    </Card>
  );
};

export default ProductDetail;
