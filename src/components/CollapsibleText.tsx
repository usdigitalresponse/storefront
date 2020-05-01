import { Typography } from '@material-ui/core';
import { useIsSmall } from '../common/hooks';
import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './CollapsibleText.module.scss';

interface Props {
  text: string;
  alwaysCollapse?: boolean;
  className?: string;
}

const CollapsibleText: React.FC<Props> = ({ text, alwaysCollapse, className }) => {
  const isSmall = useIsSmall();
  const [short, setShort] = useState<boolean>(true);

  return (
    <div className={classNames(styles.container, className, { [styles.small]: isSmall || alwaysCollapse })}>
      <Typography
        variant="body1"
        className={classNames(styles.text, { [styles.short]: short })}
        onClick={() => setShort(!short)}
      >
        {text}
      </Typography>
    </div>
  );
};

export default CollapsibleText;
