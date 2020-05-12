import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@material-ui/core';

export function useIsSmall() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  return isSmall;
}

export function usePrevious(value: any) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export function useScrollToTop() {
  const location = useLocation();
  const prevLocation = usePrevious(location);

  useEffect(() => {
    if (location !== prevLocation) {
      window.scrollTo(0, 0);
    }
  }, [location, prevLocation]);
}

export function useQueryStringParam(param: string) {
  return new URLSearchParams(useLocation().search).get(param) || '';
}
