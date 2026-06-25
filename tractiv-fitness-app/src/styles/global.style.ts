import { StyleSheet } from 'react-native';

export enum Color {
  Black = '#000000',
  Gray = '#7D8184',
  Ice = '#F0F3F4',
  Onyx = '#1B1C20',
  Rust = '#D97D54',
  Sage = '#87BCBF',
  Shadow = '#1B1C201A',
  ShadowDark = '#0000001D',
  ShadowV2 = '#42596529',
  Slate = '#6E8CA0',
  SlateDark = '#334856',
  Snow = '#FFFFFF',
  Steel = '#C8D1D3',
}

export const Shadows = {
  ShadowMd: {
    elevation: 4,
    shadowColor: Color.ShadowV2,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
};

export enum Style {
  Radius = 10,
  RadiusLg = 20,
  RadiusRound = 50,
}

export const BACKGROUND_COLOR = Color.Snow;

export const cssGlobal = StyleSheet.create({
  text_h1: {
    color: Color.Onyx,
    fontFamily: 'Europa-Bold',
    fontSize: 28,
  },
  text_h2: {
    color: Color.Onyx,
    fontFamily: 'Europa-Bold',
    fontSize: 18,
  },
  text_h3: {
    color: Color.Onyx,
    fontFamily: 'Europa-Bold',
    fontSize: 15,
  },
  text_h4: {
    color: Color.Gray,
    fontFamily: 'RiftSoft-Medium',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  text_p_16: {
    color: Color.Slate,
    fontFamily: 'Europa-Light',
    fontSize: 16,
  },
  text_p: {
    color: Color.Slate,
    fontFamily: 'Europa-Light',
    fontSize: 14,
  },
});
