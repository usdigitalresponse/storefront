import { Card, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { IDiscountCode, IOrderItem, IOrderSummary, InventoryRecord, OrderType } from '../common/types';
import { discountSelector, subtotalSelector, taxSelector, totalSelector } from '../store/cart';
import { formatCurrency, formatDiscountCode, formatPercentage } from '../common/format';
import { getProduct } from '../common/utils';
import { reverse } from '../common/router';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
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
}

const OrderSummary: React.FC<Props> = ({ className, showLineItems, editable, orderSummary }) => {
  const isSmall = useIsSmall();
  const isDonationRequest = useSelector<IAppState, boolean>((state) => state.checkout.isDonationRequest);
  const subtotal = useSelector<IAppState, number>(subtotalSelector);
  const discount = useSelector<IAppState, number>(discountSelector);
  const discountCode = useSelector<IAppState, IDiscountCode | undefined>((state) => state.checkout.discountCode);
  const taxRate = useSelector<IAppState, number>((state) => state.cms.config.taxRate);
  const tax = useSelector<IAppState, number>(taxSelector);
  const total = useSelector<IAppState, number>(totalSelector);
  const inventory = useSelector<IAppState, InventoryRecord[]>((state) => state.cms.inventory);
  const items = useSelector<IAppState, IOrderItem[]>((state) => state.cart.items);
  const isDelivery =
    useSelector<IAppState, OrderType>((state) => state.cart.orderType) === OrderType.DELIVERY ||
    !!orderSummary?.deliveryAddress;

  return (
    <Card elevation={2} className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      <Typography variant="h4" className={styles.title}>
        Order Summary
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
              Edit order
            </Link>
          )}
        </div>
      )}
      <div className={styles.section}>
        <div className={styles.line}>
          <Typography variant="body1" className={styles.label}>
            Order Subtotal
          </Typography>
          <Typography variant="body1" className={styles.value}>
            {formatCurrency(orderSummary?.subtotal || subtotal)}
          </Typography>
        </div>
        {isDonationRequest && (
          <div className={styles.line}>
            <Typography variant="body1" className={styles.label}>
              Donation Adjustment
            </Typography>
            <Typography variant="body1" className={styles.value}>
              -{formatCurrency(orderSummary?.subtotal || subtotal)}
            </Typography>
          </div>
        )}
        {(!!orderSummary?.discount || !!discount) && (
          <div className={styles.line}>
            <Typography variant="body1" className={styles.label}>
              Discount {discountCode && `(${formatDiscountCode(discountCode)})`}
            </Typography>
            <Typography variant="body1" className={styles.value}>
              -{formatCurrency(orderSummary?.discount || discount)}
            </Typography>
          </div>
        )}
        {isDelivery && (
          <div className={styles.line}>
            <Typography variant="body1" className={styles.label}>
              Delivery Fee
            </Typography>
            <Typography variant="body1" className={styles.value}>
              FREE
            </Typography>
          </div>
        )}
        <div className={styles.line}>
          <Typography variant="body1" className={styles.label}>
            Tax ({formatPercentage(taxRate)})
          </Typography>
          <Typography variant="body1" className={styles.value}>
            {formatCurrency(orderSummary?.tax || tax)}
          </Typography>
        </div>
      </div>
      <div className={classNames(styles.line, styles.total)}>
        <Typography variant="body1" className={styles.label}>
          Total
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
