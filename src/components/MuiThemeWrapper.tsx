import { IAppState } from '../store/app';
import { ThemeProvider } from '@material-ui/core';
import { useSelector } from 'react-redux';
import React from 'react';
import theme from '../common/theme';

const MuiThemeWrapper: React.FC = ({ children }) => {
  const themeColor = useSelector<IAppState, string>((state) => state.cms.themeColor);

  return <ThemeProvider theme={theme(themeColor)}>{children}</ThemeProvider>;
};

export default MuiThemeWrapper;
