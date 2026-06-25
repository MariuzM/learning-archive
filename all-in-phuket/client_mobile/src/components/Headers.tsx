import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

import { Color, HEADER_HEIGHT_FULL, STATUS_BAR_HEIGHT } from '../styles/base.style';
import { textFormat } from '../__SHARED__/utils/text.util';

import { Text } from './BaseComponents';
import { ChevronLeftIcon } from './Icons';

export const HeaderSmall = () => {
  return (
    <View
      style={{
        height: STATUS_BAR_HEIGHT,
        width: '100%',
        // borderBottomWidth: 1,
        // borderBottomColor: Color.Bg,
        backgroundColor: Color.Bg,
        // ...cssGlobal.ShadowBoxV2,
      }}
    />
  );
};

export const Header = ({ title }: { title: string }) => {
  return (
    <View
      style={{
        backgroundColor: Color.Bg,
        height: HEADER_HEIGHT_FULL,
        width: '100%',
      }}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'inherit',
          flexDirection: 'row',
          justifyContent: 'center',
          top: STATUS_BAR_HEIGHT + 10,
          width: 'auto',
        }}
      >
        <View style={{ left: 0, position: 'absolute' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <View style={{ height: 24, margin: 12, width: 24 }}>
              <ChevronLeftIcon color={Color.Accent} />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={{ color: Color.Accent, fontSize: 16 }}>{textFormat(title)}</Text>
      </View>
    </View>
  );
};
