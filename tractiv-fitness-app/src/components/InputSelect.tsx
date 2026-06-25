import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Color } from '../styles/global.style';

export const InputSelect = ({
  onPress,
  placeholder,
  rightIcon,
  setPickerType,
  value,
}: {
  onPress: () => void;
  placeholder: string;
  rightIcon: React.ReactNode;
  setPickerType: () => void;
  value?: Date | string;
}) => {
  return (
    <TouchableOpacity style={css.container} onPress={() => [onPress(), setPickerType()]}>
      {value ? (
        <Text style={[css.text, { color: Color.Black }]}>
          {typeof value === 'string' ? value : value.toISOString()}
        </Text>
      ) : (
        <Text style={css.text}>{placeholder}</Text>
      )}
      <View style={css.rightIcon}>{rightIcon}</View>
    </TouchableOpacity>
  );
};

const css = StyleSheet.create({
  container: {
    backgroundColor: Color.Snow,
    borderRadius: 10,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 20,
    position: 'relative',
  },
  text: {
    color: Color.Slate,
    fontFamily: 'Europa-Light',
    fontSize: 15,
  },
  rightIcon: {
    alignItems: 'center',
    backgroundColor: Color.Rust,
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 56,
    zIndex: 1,
  },
});
