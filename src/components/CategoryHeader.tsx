import { Typography } from '@material-ui/core';
import { useIsSmall } from '../common/hooks';
import React from 'react';
import classNames from 'classnames';
import slug from 'slug';
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
      {/* Using a hidden div positioned higher up on the page as the navigation location for URL fragments,
      as navigating directly to the header causes it to be hidden by the sticky navigation bar */}
      {categoryName && <div className={styles.anchor} id={slug(categoryName)}></div>}
      <Typography variant="h4" className={styles.header}>
        {categoryName}
      </Typography>
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default CategoryHeader;
