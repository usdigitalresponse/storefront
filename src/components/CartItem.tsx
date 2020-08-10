import { Button, Chip, Select, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { IOrderItem } from '../common/types';
import { RemoveItem, UpdateItem } from '../store/cart';
import { formatCurrency } from '../common/format';
import { getImageUrl } from '../common/utils';
import { makeProductDetailSelector } from '../store/cms';
import { useDispatch, useSelector } from 'react-redux';
import { useIsSmall } from '../common/hooks';
import CollapsibleText from './CollapsibleText';
import React, { ChangeEvent, useMemo } from 'react';
import classNames from 'classnames';
import styles from './CartItem.module.scss';

interface Props {
  item: IOrderItem;
  index?: number;
  editable?: boolean;
  className?: string;
}

const CartItem: React.FC<Props> = ({ item, editable = false, className, index }) => {
  const productDetailSelector = useMemo(makeProductDetailSelector, []);
  const product = useSelector((state: IAppState) => productDetailSelector(state, item?.id));
  const dispatch = useDispatch();
  const isSmall = useIsSmall();

  function removeItem() {
    dispatch(RemoveItem.create(index!));
  }

  function updateItem(e: ChangeEvent<any>) {
    dispatch(UpdateItem.create({ ...item, quantity: parseInt(e.target.value) }));
  }

  return product ? (
    <div className={classNames(styles.container, className, { [styles.small]: isSmall })}>
      <div className={styles.imageContainer}>
        <img className={styles.image} src={getImageUrl(product.image)} alt={product.name} />
      </div>
      <div className={styles.info}>
        <div className={styles.header}>
          <Typography variant="h4" className={styles.name}>
            {product.name}
            {product.addOn && <Chip size="small" variant="outlined" label="Add-On Item" className={styles.addon} />}
          </Typography>
          <Typography variant="body1" className={styles.price}>
            {formatCurrency(product.price)}
          </Typography>
        </div>
        <CollapsibleText alwaysCollapse={true} text={product.description} className={styles.description} />
        <div className={styles.order}>
          {!editable && (
            <Typography variant="body1" className={styles.quantityLabel}>
              &times; {item.quantity}
            </Typography>
          )}
          {editable && (
            <>
              <Select
                native
                className={styles.quantity}
                color="primary"
                variant="outlined"
                value={item.quantity}
                inputProps={{ name: 'quantity' }}
                onChange={updateItem}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </Select>
              <Button color="primary" onClick={removeItem}>
                Remove
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default CartItem;
