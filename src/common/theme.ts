import {
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

function themeWithColor(color: string): any {
  let themeColor: Record<string, string> = indigo;

  if (color === 'red') themeColor = red;
  if (color === 'pink') themeColor = pink;
  if (color === 'purple') themeColor = purple;
  if (color === 'deepPurple') themeColor = deepPurple;
  if (color === 'indigo') themeColor = indigo;
  if (color === 'blue') themeColor = blue;
  if (color === 'lightBlue') themeColor = lightBlue;
  if (color === 'cyan') themeColor = cyan;
  if (color === 'teal') themeColor = teal;
  if (color === 'green') themeColor = green;
  if (color === 'lightGreen') themeColor = lightGreen;
  if (color === 'lime') themeColor = lime;
  if (color === 'yellow') themeColor = yellow;
  if (color === 'amber') themeColor = amber;
  if (color === 'orange') themeColor = orange;
  if (color === 'deepOrange') themeColor = deepOrange;
  if (color === 'brown') themeColor = brown;
  if (color === 'grey') themeColor = grey;
  if (color === 'blueGrey') themeColor = blueGrey;

  return {
    palette: {
      primary: themeColor,
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      body1: { letterSpacing: '-0.032em' },
      body2: { letterSpacing: '-0.025em' },
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
          cursor: 'pointer',
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
  };
}

function theme(color: string) {
  return createMuiTheme(themeWithColor(color));
}

export default theme;
