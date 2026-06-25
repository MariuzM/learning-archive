import { colors } from '../styles/colors.style';

export type Colors = {
  [key in keyof typeof colors]: string;
};

export type TypeColorPicker = keyof typeof colors;

type Border = {
  main: string;
  radius: string;
};

export type Palette = {
  background: Record<'main', string>;
  header: Record<'main', string>;
};

export type CustomTheme = {
  customColors: Colors;
  customPalette: Palette;
  customBorder: Border;
};

declare module '@mui/material/styles' {
  interface Theme extends CustomTheme {}
  interface ThemeOptions extends CustomTheme {}
}
