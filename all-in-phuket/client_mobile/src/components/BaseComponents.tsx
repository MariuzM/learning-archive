import type { TextStyle } from 'react-native';
import { Text as RNText, StyleSheet } from 'react-native';

import { formatNumber } from '../__SHARED__/utils/formaters.util';
import { Color } from '../styles/base.style';

// ==================================================================

export const Text = ({
  children = '',
  style,
  maxLines,
}: {
  maxLines?: number;
  children?: string | string[] | number | undefined;
  style?: TextStyle;
}) => {
  return (
    <RNText {...(maxLines && { numberOfLines: maxLines })} style={[css.text, style]}>
      {children}
    </RNText>
  );
};

// ==================================================================

export const TextPrice = ({ price, style }: { price: number; style?: TextStyle }) => {
  return <RNText style={[css.text, style]}>฿ {formatNumber(price)}</RNText>;
};

// ==================================================================

const css = StyleSheet.create({
  text: {
    color: Color.Text,
  },
});
