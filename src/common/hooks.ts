import { useMediaQuery } from '@material-ui/core';
import theme from './theme';

export function useIsSmall() {
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  return isSmall;
}
