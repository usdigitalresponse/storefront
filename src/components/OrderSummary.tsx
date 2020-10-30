import { Card, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { IConfig, IDiscountCode, IOrderItem, IOrderSummary, InventoryRecord, OrderType } from '../common/types';
import {
  discountDollarAmountsSelector,
  itemsSelector,
  subtotalSelector,
  taxSelector,
  tipSelector,
  totalSelector,
} from '../store/cart';
import { formatCurrency, formatDiscountCode, formatPercentage } from '../common/format';
import { getProduct } from '../common/utils';
import { inventorySelector } from '../store/cms';
import { reverse } from '../common/router';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import Content from './Content';
import DiscountCode from './DiscountCode';
import Link from './Link';
import React from 'react';
import classNames from 'classnames';
import styles from './OrderSummary.module.scss';

interface Props {
  showLineItems?: boolean;
  editable?: boolean;
  className?: string;
  orderSummary?: IOrderSummary;
  showTip?: boolean;
}

const OrderSummary: React.FC<Props> = ({ className, showLineItems, editable, orderSummary, showTip = false }) => {
  const isSmall = useIsSmall();
  const isDonationRequest = useSelector<IAppState, boolean>((state) => state.checkout.isDonationRequest);
  const subtotal = useSelector<IAppState, number>(subtotalSelector);
  const discountDollarAmounts = useSelector<IAppState, Record<string, number>>(discountDollarAmountsSelector);
  const discountCodes = useSelector<IAppState, IDiscountCode[]>((state) => state.checkout.discountCodes);
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  const { taxRate, tippingEnabled, deliveryFee } = config;
  const tipPercentage = useSelector<IAppState, number>((state) => state.checkout.tipPercentage);
  const tax = useSelector<IAppState, number>(taxSelector);
  const tip = useSelector<IAppState, number>(tipSelector);
  const total = useSelector<IAppState, number>(totalSelector);
  const inventory = useSelector<IAppState, InventoryRecord[]>(inventorySelector);
  const items = useSelector<IAppState, IOrderItem[]>(itemsSelector);
  const isDelivery =
    useSelector<IAppState, OrderType>((state) => state.cart.orderType) === OrderType.DELIVERY ||
    !!orderSummary?.deliveryAddress;

  return (
    <Card elevation={2} className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      <Typography variant="h4" className={styles.title}>
        <Content id="order_summary_header" defaultText="Order Summary" />
      </Typography>
      {showLineItems && (
        <div className={styles.section}>
          {(orderSummary?.items || items).map((cartItem) => {
            const product = getProduct(cartItem.id, inventory);
            return product ? (
              <div key={cartItem.id} className={styles.lineItem}>
                <Typography variant="body1" className={styles.label}>
                  {product.name}
                </Typography>
                <Typography variant="body1" className={styles.qty}>
                  &times; {cartItem.quantity}
                </Typography>
                <Typography variant="body1" className={styles.value}>
                  {formatCurrency(product.price)}
                </Typography>
              </div>
            ) : null;
          })}
          {editable && !isDonationRequest && (
            <Link className={styles.edit} href={reverse('cart')}>
              <Content id="order_summary_edit_order" defaultText="Edit order" />
            </Link>
          )}
        </div>
      )}
      <div className={styles.section}>
        <div className={styles.line}>
          <Typography variant="body1" className={styles.label}>
            <Content id="order_summary_subtotal" defaultText="Order Subtotal" />
          </Typography>
          <Typography variant="body1" className={styles.value}>
            {formatCurrency(orderSummary?.subtotal || subtotal)}
          </Typography>
        </div>
        {isDonationRequest && (
          <div className={styles.line}>
            <Typography variant="body1" className={styles.label}>
              <Content id="order_summary_donation_adjustment_label" defaultText="Donation Adjustment" />
            </Typography>
            <Typography variant="body1" className={styles.value}>
              -{formatCurrency(orderSummary?.subtotal || subtotal)}
            </Typography>
          </div>
        )}
        {orderSummary?.discount ? (
          <div className={styles.line}>
            <Typography variant="body1" className={styles.label}>
              Discounts
            </Typography>
            <Typography variant="body1" className={styles.value}>
              -{formatCurrency(orderSummary?.discount)}
            </Typography>
          </div>
        ) : (
          discountCodes.map((discountCode, index) => (
            <div key={`${index}-${discountCode}`} className={styles.line}>
              <Typography variant="body1" className={styles.label}>
                {discountCode.code} {discountCode && `(${formatDiscountCode(discountCode)})`}
              </Typography>
              <Typography variant="body1" className={styles.value}>
                -{formatCurrency(discountDollarAmounts[discountCode.code])}
              </Typography>
            </div>
          ))
        )}
        {isDelivery && (
          <div className={styles.line}>
            <Typography variant="body1" className={styles.label}>
              <Content id="order_summary_delivery_fee" defaultText="Delivery Fee" />
            </Typography>
            <Typography variant="body1" className={styles.value}>
              {deliveryFee > 0 ? (
                formatCurrency(deliveryFee)
              ) : (
                <Content id="order_summary_delivery_fee_free" defaultText="FREE" />
              )}
            </Typography>
          </div>
        )}
        <div className={styles.line}>
          <Typography variant="body1" className={styles.label}>
            <Content id="order_summary_tax" defaultText="Tax" /> ({formatPercentage(taxRate)})
          </Typography>
          <Typography variant="body1" className={styles.value}>
            {formatCurrency(orderSummary?.tax || tax)}
          </Typography>
        </div>
        {showTip && (tippingEnabled || orderSummary?.tip) && (
          <div className={styles.line}>
            <Typography variant="body1" className={styles.label}>
              <Content id="tip_label" defaultText="Tip" />
              {!orderSummary && ` (${formatPercentage(tipPercentage / 100)})`}
            </Typography>
            <Typography variant="body1" className={styles.value}>
              {formatCurrency(orderSummary?.tip || tip)}
            </Typography>
          </div>
        )}
      </div>
      <div className={classNames(styles.line, styles.total)}>
        <Typography variant="body1" className={styles.label}>
          <Content id="order_summary_total" defaultText="Total" />
        </Typography>
        <Typography variant="body1" className={styles.value}>
          {formatCurrency(isDonationRequest ? 0 : orderSummary?.total || total)}
        </Typography>
      </div>
      {editable && <DiscountCode className={styles.discount} />}
    </Card>
  );
};

export default OrderSummary;
