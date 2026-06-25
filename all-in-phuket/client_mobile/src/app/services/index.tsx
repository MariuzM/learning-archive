import { useRouter } from 'expo-router';
import { ScrollView, TouchableOpacity } from 'react-native';

import { Text } from '../../components/BaseComponents';
import { Box } from '../../components/Boxes';
import { useStateInit } from '../../states/init.state';
import { cssComps, TAB_HIDE_CONTENT_HEIGHT } from '../../styles/base.style';
import { textFormat } from '../../__SHARED__/utils/text.util';

export default function CategoriesPage() {
  const data = useStateInit((s) => s.data);
  const router = useRouter();

  function onPress(item: string) {
    if (item === 'real_estate') {
      router.push('/services/serviceTopTab');
      router.setParams({ service: item });
      return;
    }
    router.push('/services/service');
    router.setParams({ service: item });
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ marginBottom: TAB_HIDE_CONTENT_HEIGHT }}
      contentContainerStyle={cssComps.boxContainer}
    >
      {data.map((item, idx) => {
        return (
          <TouchableOpacity
            key={idx}
            accessibilityRole="button"
            onPress={() => onPress(item.service)}
          >
            <Box>
              <Text style={{ textAlign: 'center' }}>{textFormat(item.service)}</Text>
            </Box>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
