import { Typography } from '@material-ui/core';
import { useIsSmall } from '../common/hooks';
import React from 'react';
import classNames from 'classnames';
import styles from './CategoryHeader.module.scss';

interface Props {
  categoryName?: string;
  description?: string;
  centered?: boolean;
}

const CategoryHeader: React.FC<Props> = ({ categoryName, description, centered }) => {
  const isSmall = useIsSmall();

  return (
    <div className={classNames(styles.container, centered && styles.centered, isSmall && styles.small)}>
      <Typography variant="h4" className={styles.header}>
        {categoryName}
      </Typography>
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default CategoryHeader;
