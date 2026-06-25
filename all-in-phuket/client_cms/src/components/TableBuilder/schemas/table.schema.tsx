import { Badge } from '@mantine/core';

import { formatNumber } from '../../../-----SHARED-----/utils/formaters.util';
import { textFormat } from '../../../-----SHARED-----/utils/text.util';
import { Color, Style } from '../../../styles/base.style';

export type ItemTypes =
  | 'string'
  | 'number'
  | 'price'
  | 'boolean'
  | 'dropdown'
  | 'multiSelect'
  | 'imageUpload';

export const COLUMN_NAMES_OBJECT: {
  [K: string]: {
    name: string;
    width: number;
    editable?: boolean;
    type?: ItemTypes;
    formater?: (value: any) => string | React.ReactNode;
  };
} = {
  amenities: {
    name: 'Amenities',
    width: 200,
    editable: true,
    formater: (v: string[]) => (
      <div className="flex flex-wrap gap-2">
        {v.map((amenity, i) => (
          <Badge
            key={i}
            size="md"
            // color="none"
            style={{
              backgroundColor: Color.BgDark,
              color: Color.Text,
              padding: '12px',
              textTransform: 'none',
            }}
          >
            {textFormat(amenity)}
          </Badge>
        ))}
      </div>
    ),
  },
  availabilityType: {
    name: 'Availability Type',
    width: 150,
    editable: true,
    formater: (v: string) => textFormat(v),
  },
  bedroomCount: {
    name: 'Bedroom Count',
    width: 150,
    editable: true,
  },
  contractDuration: {
    name: 'Contract Duration',
    width: 150,
    editable: true,
    formater: (v: string) => textFormat(v),
  },
  createdAt: {
    name: 'Created At',
    width: 200,
    editable: true,
    formater: (v: string) => new Date(v).toLocaleDateString(),
  },
  description: {
    name: 'Description',
    width: 450,
    editable: true,
  },
  id: {
    name: 'ID',
    width: 30,
  },
  images: {
    name: 'Images',
    width: 250,
    editable: true,
    formater: (v: string[]) => (
      <div className="flex flex-wrap gap-2">
        {v.map((img, i) => (
          <a href={img} target="_blank" rel="noopener noreferrer" key={i}>
            <img
              key={i}
              src={img}
              alt={`img-${i}`}
              style={{ width: '50px', height: '50px', borderRadius: Style.RadiusSm }}
            />
          </a>
        ))}
      </div>
    ),
  },
  location: {
    name: 'Location',
    width: 150,
    editable: true,
  },
  name: {
    name: 'Name',
    width: 250,
    editable: true,
  },
  ownershipStatus: {
    name: 'Ownership Status',
    width: 150,
    editable: true,
    formater: (v: string) => textFormat(v),
  },
  price: {
    name: 'Price',
    width: 110,
    editable: true,
    formater: (v: number) => <>฿ {formatNumber(v)}</>,
  },
  propertyType: {
    name: 'Property Type',
    width: 150,
    editable: true,
    formater: (v: string) => textFormat(v),
  },
  serviceId: {
    name: 'Service ID',
    width: 90,
  },
  showerCount: {
    name: 'Shower Count',
    width: 150,
    editable: true,
  },
};

export const FORM_FIELDS_TYPES: {
  [K: string]: { type: ItemTypes };
} = {
  amenities: { type: 'multiSelect' },
  availabilityType: { type: 'dropdown' },
  bedroomCount: { type: 'number' },
  contractDuration: { type: 'dropdown' },
  images: { type: 'imageUpload' },
  ownershipStatus: { type: 'dropdown' },
  price: { type: 'price' },
  propertyType: { type: 'dropdown' },
  showerCount: { type: 'number' },
};
