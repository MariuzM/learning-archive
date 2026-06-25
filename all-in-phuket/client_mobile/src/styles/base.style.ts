import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';

export const BACKGROUND_COLOR = '#181410';

export const STATUS_BAR_HEIGHT = Constants.statusBarHeight;
export const HEADER_HEIGHT = 50;
export const HEADER_HEIGHT_FULL = STATUS_BAR_HEIGHT + HEADER_HEIGHT;
export const CONTENT_PADDING_X = 8;

export const TAB_BAR_HEIGHT = 70;
export const TAB_BAR_POSITION_FROM_BOTTOM = 30;
export const TAB_BAR_HEIGHT_FULL = TAB_BAR_HEIGHT + TAB_BAR_POSITION_FROM_BOTTOM;
export const TAB_HIDE_CONTENT_HEIGHT = 60;

export enum Color {
  Bg = BACKGROUND_COLOR,

  BgTop = '#2a231c',
  BgBottom = BACKGROUND_COLOR,

  ActiveBgTop = '#BF9474',
  ActiveBgBottom = '#4C2F29',
  // BgLight = '#e9892a',

  // Bg1 = ColorPalet.Shade2,
  // Bg2 = ColorPalet.Shade3,

  // Highlight = ColorPalet.Highlight,
  Accent = '#C2947E',
  Text = '#d6a087',
  TextDark = '#73695e',

  // Info = ColorPalet.Accent,
  // Success = ColorPalet.Success,
  // Warning = ColorPalet.Warning,
  // Error = ColorPalet.Error,

  Shadow = '#4c2f2972',
  ShadowDark = '#181410',

  // Success = '#16b679',
  // Warning = '#f5a623',
  // Error = '#f64150',
}

export enum Style {
  RadiusSm = 4,
  Radius = 12,
  RadiusLg = 24,
  RadiusLg2 = 32,
  RadiusLg3 = 50,
}

export const cssShadow = {
  ShadowBox: {
    elevation: 4,
    shadowColor: Color.Shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  ShadowBoxV2: {
    elevation: 4,
    shadowColor: Color.ShadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
};

export const cssGlobal = StyleSheet.create({
  // screenEdge: {
  //   marginHorizontal: CONTENT_PADDING_X,
  // },
  text_h1: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  text_h2: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text_h3: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  text_h4: {
    fontSize: 14,
  },
  text_p: {
    fontSize: 20,
  },
  text_p_sm: {
    fontSize: 14,
  },
  textColor: {
    color: Color.Text,
  },
  ShadowBoxV2: {
    elevation: 4,
    shadowColor: Color.ShadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  flexRowItemCenterGap8: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});

export const cssComps = StyleSheet.create({
  boxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'space-between',
    paddingBottom: 50,
    paddingHorizontal: 12,
    paddingVertical: 20,
    width: '100%',
  },
});
