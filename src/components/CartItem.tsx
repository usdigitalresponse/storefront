import { Card, Select, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { ICartItem } from '../common/types';
import { formatCurrency } from '../common/format';
import { getImageUrl } from '../common/utils';
import { makeProductDetailSelector } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import styles from './CartItem.module.scss';

interface Props {
  item: ICartItem;
  editable?: boolean;
}

const CartItem: React.FC<Props> = ({ item, editable = false }) => {
  const productDetailSelector = useMemo(makeProductDetailSelector, []);
  const isSmall = useIsSmall();
  const product = useSelector((state: IAppState) => productDetailSelector(state, item?.id));

  return product ? (
    <Card elevation={2} className={classNames(styles.container, { [styles.small]: isSmall })}>
      <div className={styles.image} style={{ backgroundImage: `url(${getImageUrl(product.image)})` }} />
      <div className={styles.info}>
        <Typography variant="h4" className={styles.productName}>
          {product.name}
        </Typography>
        <div className={styles.order}>
          <Typography variant="body1" className={styles.price}>
            {formatCurrency(product.price)}
          </Typography>
          {!editable && (
            <Typography variant="body1" className={styles.quantity}>
              &times; {item.quantity}
            </Typography>
          )}
          {editable && (
            <Select
              native
              className={styles.quantity}
              color="primary"
              variant="outlined"
              value={item.quantity}
              inputProps={{ name: 'quantity' }}
              // onChange={(e: ChangeEvent<any>) => setQuantity(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(q => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>
    </Card>
  ) : null;
};

export default CartItem;
