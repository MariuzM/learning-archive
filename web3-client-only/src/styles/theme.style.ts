import { unstable_ClassNameGenerator as cn } from '@mui/material/className';
import { createTheme } from '@mui/material/styles';

import { type Palette } from '../types/theme.type';
import { colors } from './colors.style';
import { components } from './components.style';

const customBorder = {
  main: '1px solid #000',
  radius: '20px',
};

const customPalette: Palette = {
  background: {
    main: colors.mainBackground,
  },
  header: {
    main: colors.pinkLight,
  },
};

const typography = {
  fontFamily: [
    'Montserrat',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
};

cn.configure(() => 'w3');

export const theme = createTheme({
  customColors: colors,
  customPalette,
  customBorder,
  components,
  typography,
});
