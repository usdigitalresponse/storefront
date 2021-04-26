import { Link as MaterialLink } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import React from 'react';

const Link = React.forwardRef((props: any, ref) => {
  const href = props.href || '';
  const isRelative = /^\//.test(href);

  let target = '';
  if (props.newTab) {
    target = '_new';
  }

  return isRelative ? (
    <MaterialLink ref={ref} to={href} component={RouterLink} {...{ ...props }} />
  ) : (
    <MaterialLink ref={ref} href={href} target={target} {...{ ...props }} />
  );
});

export default Link;
