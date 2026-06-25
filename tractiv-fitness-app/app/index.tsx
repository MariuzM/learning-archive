import type GBottomSheet from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_Activities } from '../src/apis/main.api';
import { ActivityBox } from '../src/components/ActivityItem';
import { ActivitySection } from '../src/components/ActivitySection';
import { BottomSheet } from '../src/components/BottomSheets';
import { Button } from '../src/components/Buttons';
import { Header } from '../src/components/Header';
import { cssGlobal } from '../src/styles/global.style';

export default function HomePage() {
  const bottomSheetRef = useRef<GBottomSheet>(null);

  return (
    <>
      <SafeAreaView edges={['right', 'left', 'top']} style={css.container}>
        <Header />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={css.content}>
            <Text style={cssGlobal.text_h2}>Track Your Activity</Text>
            <View style={css.contentListItems}>
              {API_Activities.map((item) => (
                <ActivityBox key={item.id} {...item} />
              ))}
            </View>
          </View>

          <View style={css.footer}>
            <ActivitySection />
            <Button bottomSheetRef={bottomSheetRef} />
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomSheet bottomSheetRef={bottomSheetRef} />
    </>
  );
}

const css = StyleSheet.create({
  container: {
    height: '100%',
  },
  content: {
    alignItems: 'center',
    marginTop: 20,
  },
  contentListItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    paddingHorizontal: 30,
    paddingVertical: 20,
    width: '100%',
  },
  footer: {
    paddingHorizontal: 20,
    marginBottom: 40,
    gap: 20,
  },
});
