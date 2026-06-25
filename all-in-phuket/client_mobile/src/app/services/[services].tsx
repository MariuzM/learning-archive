import { useLocalSearchParams } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { textFormat } from '../../__SHARED__/utils/text.util';
import { Text } from '../../components/BaseComponents';
import { Box } from '../../components/Boxes';
import { BgGradiant } from '../../components/Gradiants';
import { useStateInit } from '../../states/init.state';
import { cssComps } from '../../styles/base.style';

export default function ServicePage() {
  const slug = useLocalSearchParams();
  const services = useStateInit((s) => s.data);
  const listings = services.find((item) => item.service === String(slug.service))?.listings || [];

  function onPress(item: string) {
    console.log('🚀 ~ item:', item);
  }

  return (
    <BgGradiant>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={cssComps.boxContainer}>
          {listings.map((item, idx) => {
            return (
              <TouchableOpacity
                key={idx}
                accessibilityRole="button"
                onPress={() => onPress(item.name)}
              >
                <Box>
                  <Text>{textFormat(item.name)}</Text>
                </Box>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </BgGradiant>
  );
}
