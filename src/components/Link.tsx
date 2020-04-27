import { LinkProps, Link as MaterialLink } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import React from 'react';

const Link: React.FC<LinkProps> = props => {
  const href = props.href || '';
  const isRelative = /^\//.test(href);

  return isRelative ? (
    <MaterialLink to={href} component={RouterLink} {...props} />
  ) : (
    <MaterialLink href={href} {...props} />
  );
};

export default Link;
