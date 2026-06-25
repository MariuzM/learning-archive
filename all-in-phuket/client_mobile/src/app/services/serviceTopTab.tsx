import { useLocalSearchParams } from 'expo-router';

import { BgGradiant } from '../../components/Gradiants';
import { TabSlider } from '../../components/TabSlider';
import { useStateInit } from '../../states/init.state';
import { transformData } from '../../utils/formatForTabs.util';

export default function ServiceTopTabPage(p: any) {
  const slug = useLocalSearchParams();
  const services = useStateInit((s) => s.data);
  const sv = services.find((item) => item.service === String(slug.service));

  if (!sv) return null;

  return (
    <BgGradiant>
      <TabSlider items={transformData(sv)} />
    </BgGradiant>
  );
}

const t1 = {
  listings: [
    {
      bedroomCount: 2,
      id: 1,
      location: 'city 1',
      name: 'house 1',
      availabilityType: 'long_term',
      price: 100,
      propertyType: 'apartment',
      saleOwnershipStatus: null,
    },
    {
      bedroomCount: 2,
      id: 12,
      location: 'city 1',
      name: 'house 2',
      availabilityType: 'long_term',
      price: 100,
      propertyType: 'apartment',
      saleOwnershipStatus: null,
    },
    {
      bedroomCount: 2,
      id: 13,
      location: 'city 1',
      name: 'house 4',
      availabilityType: 'long_term',
      price: 100,
      propertyType: 'apartment',
      saleOwnershipStatus: null,
    },
    {
      bedroomCount: 2,
      id: 14,
      location: 'city 1',
      name: 'house 1',
      availabilityType: 'long_term',
      price: 100,
      propertyType: 'apartment',
      saleOwnershipStatus: null,
    },
    {
      bedroomCount: 2,
      id: 15,
      location: 'city 1',
      name: 'house 1',
      availabilityType: 'long_term',
      price: 100,
      propertyType: 'apartment',
      saleOwnershipStatus: null,
    },
    {
      bedroomCount: 2,
      id: 56,
      location: 'city 1',
      name: 'house 1',
      availabilityType: 'long_term',
      price: 100,
      propertyType: 'apartment',
      saleOwnershipStatus: null,
    },
    {
      bedroomCount: 2,
      id: 4,
      location: 'city 1',
      name: 'house 1',
      availabilityType: 'long_term',
      price: 100,
      propertyType: 'apartment',
      saleOwnershipStatus: null,
    },
    {
      bedroomCount: 3,
      id: 2,
      location: 'city 2',
      name: 'condo 1',
      availabilityType: 'short_term',
      price: 200,
      propertyType: 'condominium',
      saleOwnershipStatus: null,
    },
    {
      bedroomCount: 4,
      id: 3,
      location: 'city 3',
      name: 'apartment 2',
      availabilityType: 'sale',
      price: 300,
      propertyType: 'hotel',
      saleOwnershipStatus: 'freehold',
    },
  ],
  service: 'real_estate',
};
