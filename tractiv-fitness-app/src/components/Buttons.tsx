import type BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Color } from '../styles/global.style';

import { AddIcon } from './Icons';

export const Button = ({
  bottomSheetRef,
}: {
  bottomSheetRef: React.MutableRefObject<BottomSheet | null>;
}) => {
  return (
    <TouchableOpacity
      onPress={() => bottomSheetRef.current?.expand()}
      style={[css.container, css.shadow, { backgroundColor: Color.Rust }]}
    >
      <AddIcon />
      <Text style={css.text}>{'Schedule activity'.toLocaleUpperCase()}</Text>
    </TouchableOpacity>
  );
};

export const ButtonV2 = ({
  bottomSheetRef,
  isDisabled,
  handleSubmit,
}: {
  bottomSheetRef: React.MutableRefObject<BottomSheet | null>;
  isDisabled: boolean;
  handleSubmit: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={() => !isDisabled && [bottomSheetRef.current?.close(), handleSubmit()]}
      style={[
        css.container,
        {
          backgroundColor: isDisabled ? Color.Steel : 'transparent',
          borderColor: isDisabled ? Color.Steel : Color.Slate,
          borderWidth: 1,
        },
      ]}
    >
      <Text style={css.text}>SCHEDULE</Text>
    </TouchableOpacity>
  );
};

const css = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 50,
    flexDirection: 'row',
    gap: 10,
    height: 50,
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  shadow: {
    shadowColor: Color.Shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 7,
  },
  text: {
    color: Color.Snow,
    fontFamily: 'RiftSoft-Demi',
    fontSize: 14,
    letterSpacing: 2.1,
  },
});
