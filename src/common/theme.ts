import { createMuiTheme } from '@material-ui/core/styles';
import { indigo } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: indigo,
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontWeight: 'normal' },
    h2: { fontWeight: 'normal' },
    h3: { fontWeight: 'normal' },
    h4: { fontWeight: 'normal' },
    h5: { fontWeight: 'normal' },
    h6: { fontWeight: 'normal' },
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
      },
      contained: {
        color: 'white !important',
        opacity: 0.9,
        transition: 'opacity 0.3s',
        '&:hover': {
          opacity: 1,
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
        transition: 'color 0.3s, opacity 0.3s',
        '&:hover': {
          color: 'rgba(0,0,0,0.87)',
        },
      },
    },
  },
  props: {
    MuiButton: {
      disableElevation: true,
      disableRipple: true,
    },
    MuiButtonBase: {
      // disableRipple: true,
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
