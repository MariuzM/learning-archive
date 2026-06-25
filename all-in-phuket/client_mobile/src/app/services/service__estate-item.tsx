import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { RealEstate } from '../../__SHARED__/types/listings.type';
import { textFormat } from '../../__SHARED__/utils/text.util';
import { Text, TextPrice } from '../../components/BaseComponents';
import { BackNavButton } from '../../components/Buttons';
import { BedIcon, MapPinIcon, ShowerIcon } from '../../components/Icons';
import { PageSwiper } from '../../components/PageSwiper';
import { Color, cssGlobal, Style, TAB_HIDE_CONTENT_HEIGHT } from '../../styles/base.style';

export default function EstateItemStackPage(p: any) {
  const slug = useLocalSearchParams().estateItemStack as string;
  const item = JSON.parse(slug) as RealEstate;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={css.root}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <View style={css.imageContainer}>
        {item.images && item.images.length > 0 ? <PageSwiper items={item.images} /> : null}
      </View>
      <BackNavButton />

      <View style={css.content}>
        <Text style={css.headerFont}>{item.name}</Text>

        <View style={{ marginTop: 20, gap: 30 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 4 }}>
              <MapPinIcon />
              <Text>{item.location}</Text>
            </View>

            <TextPrice style={css.subHeaderFont} price={item.price} />
          </View>

          <View style={{ flexDirection: 'row', gap: 20 }}>
            <View style={[cssGlobal.flexRowItemCenterGap8, css.iconContainer]}>
              <BedIcon />
              <Text style={css.iconFont}>{item.bedroomCount}</Text>
            </View>

            <View style={[cssGlobal.flexRowItemCenterGap8, css.iconContainer]}>
              <ShowerIcon />
              <Text style={css.iconFont}>{item.showerCount}</Text>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={css.subHeaderFont}>Description</Text>
            <Text>{item.description}</Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={css.subHeaderFont}>Amenities</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {item.amenities &&
                item.amenities.map((f, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: Color.BgTop,
                      borderRadius: Style.RadiusLg3,
                      padding: 12,
                    }}
                  >
                    <Text>{textFormat(f)}</Text>
                  </View>
                ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const css = StyleSheet.create({
  root: {
    backgroundColor: Color.Bg,
    height: '100%',
    marginBottom: TAB_HIDE_CONTENT_HEIGHT,
  },
  imageContainer: {
    backgroundColor: Color.BgTop,
    height: 400,
    width: '100%',
  },
  content: {
    marginTop: -10,
    paddingHorizontal: 20,
  },
  headerFont: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  subHeaderFont: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconContainer: {
    backgroundColor: Color.BgTop,
    borderRadius: Style.Radius,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconFont: {
    fontSize: 24,
  },
});
