import { SetConfirmation } from '../store/checkout';
import { reverse } from './router';
import { useDispatch } from 'react-redux';
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

export function useClearConfirmation() {
  const dispatch = useDispatch();
  const location = useLocation();
  const prevLocation = usePrevious(location);

  useEffect(() => {
    if (location !== prevLocation && prevLocation === reverse('confirmation')) {
      dispatch(SetConfirmation.create(undefined));
    }
  }, [location, prevLocation, dispatch]);
}

export function useQueryStringParam(param: string) {
  return new URLSearchParams(useLocation().search).get(param) || '';
}
