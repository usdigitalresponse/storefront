import { createMuiTheme } from '@material-ui/core/styles';
import { indigo } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: indigo,
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
        '&:active': {
          boxShadow: 'none',
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: 12,
      },
    },
    MuiLink: {
      root: {
        opacity: 0.8,
        transition: 'opacity 0.3s',
        '&:hover': {
          opacity: 1,
        },
      },
    },
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
    MuiCheckbox: {
      disableRipple: true,
    },
    MuiLink: {
      underline: 'none',
    },
  },
});

export default theme;
