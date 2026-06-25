import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Color, cssGlobal } from '../styles/global.style';

export const RoundedIcon = ({
  icon,
  name,
  isSelected,
  onPress,
}: {
  icon: ({ isPressed }: { isPressed?: boolean }) => JSX.Element;
  name: string;
  isSelected?: boolean;
  onPress?: () => void;
}) => {
  return (
    <View style={css.container}>
      <TouchableOpacity
        onPress={onPress}
        style={{ ...css.button, backgroundColor: isSelected ? Color.Rust : Color.Snow }}
      >
        <View>{icon({ isPressed: isSelected })}</View>
      </TouchableOpacity>
      <Text style={css.name}>{name}</Text>
    </View>
  );
};

const css = StyleSheet.create({
  container: {
    gap: 8,
  },
  button: {
    alignItems: 'center',
    borderRadius: 50,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  icon: {
    height: 20,
    width: 20,
  },
  name: {
    ...cssGlobal.text_p,
    fontFamily: 'RiftSoft-Medium',
    alignSelf: 'center',
    color: Color.Snow,
  },
});
