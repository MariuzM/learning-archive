import { createRef } from 'react';
import type { View } from 'react-native';

import type { RealEstate } from '../__SHARED__/types/listings.type';
import type { Init } from '../types/init.type';

export type TransformedInit = {
  service: string;
  tabs: TabItemT[];
};

export type TabItemT = {
  ref: React.RefObject<View>;
  title: string;
  listings?: RealEstate[];
};

export function transformData(data: Init): TransformedInit {
  const tabsMap: { [key: string]: { availabilityType: string }[] } = {};

  for (const listing of data.listings) {
    const { availabilityType } = listing;
    if (!tabsMap[availabilityType]) {
      tabsMap[availabilityType] = [];
    }
    tabsMap[availabilityType].push(listing);
  }

  const tabItems = Object.keys(tabsMap).map((title) => ({
    ref: createRef(),
    title,
    listings: tabsMap[title],
  })) as TabItemT[];

  return {
    service: data.service,
    tabs: tabItems,
  };
}
