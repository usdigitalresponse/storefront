import { ButtonBase, Typography } from '@material-ui/core';
import { InventoryRecord } from '../common/types';
import { formatCurrency } from '../common/format';
import { getImageUrl } from '../common/utils';
import { useHistory } from 'react-router-dom';
import { useIsSmall } from '../common/hooks';
import React from 'react';
import classNames from 'classnames';
import styles from './ProductSummary.module.scss';

interface Props {
  product: InventoryRecord;
  className?: string;
}

const ProductSummary: React.FC<Props> = ({ product, className }) => {
  const { id, name, image, price } = product;
  const isSmall = useIsSmall();
  const history = useHistory();

  return (
    <ButtonBase
      className={classNames(styles.container, className, { [styles.small]: isSmall })}
      onClick={() => history.push(`products/${id}`)}
    >
      <img className={styles.image} src={getImageUrl(image)} alt={name} />
      <Typography variant="body1" className={styles.name}>
        {name}
      </Typography>
      <Typography variant="body1" className={styles.price}>
        {formatCurrency(price)}
      </Typography>
    </ButtonBase>
  );
};

export default ProductSummary;
