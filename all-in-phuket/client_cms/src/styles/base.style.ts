export const BACKGROUND_COLOR = 'var(--Bg)';

export enum Color {
  Bg = BACKGROUND_COLOR,
  BgLight = '#2a2f36',
  BgDark = '#1a1f25',
  BgDarker = '#12161b',

  Accent = 'var(--Accent)',
  Text = '#d6a087',
  TextDark = '#73695e',

  Shadow = '#4c2f2972',
  ShadowDark = '#181410',
}

export enum Style {
  RadiusSm = 4,
  Radius = 12,
  RadiusLg = 24,
  RadiusLg2 = 32,
  RadiusLg3 = 50,
}

export const cssGlobal = {
  h1: {
    fontSize: 32,
  },
  h2: {
    fontSize: 24,
  },
  p: {
    fontSize: 16,
  },
  p_sm: {
    fontSize: 14,
  },
};

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
