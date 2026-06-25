import type { RealEstate } from '../../-----SHARED-----/types/listings.type';
import { TableBuilder } from '../../components/TableBuilder/TableBuilder';
import type { Schema } from '../../components/TableBuilder/types/schema.type';

const schema: Schema<RealEstate> = {
  initialValues: {
    name: '',
    location: '',
    price: '' as unknown as number,
    images: [],
    description: '',
    amenities: [],
    availabilityType: '',
    contractDuration: '',
    bedroomCount: '' as unknown as number,
    showerCount: '' as unknown as number,
    ownershipStatus: '',
    propertyType: '',
  },
  validate: {
    name: (v) => (v.length > 0 ? null : 'Name is required'),
    location: (v) => (v.length > 0 ? null : 'Location is required'),
    price: (v) => (v > 0 ? null : 'Price is required'),
    images: (v) => (v && v.length > 0 ? null : 'At least one image is required'),
    description: (v) => (v.length > 0 ? null : 'Description is required'),
    amenities: (v) => (v && v.length > 0 ? null : 'Amenities is required'),
    availabilityType: (v) => (v.length > 0 ? null : 'Availability Type is required'),
    contractDuration: (v) => (v.length > 0 ? null : 'Contract Duration is required'),
    bedroomCount: (v) => (v > 0 ? null : 'Bedroom Count is required'),
    showerCount: (v) => (v > 0 ? null : 'Shower Count is required'),
    ownershipStatus: (v) => (v.length > 0 ? null : 'Ownership Status is required'),
    propertyType: (v) => (v.length > 0 ? null : 'Property Type is required'),
  },
};

export const RealEstateService = () => {
  return <TableBuilder serviceName="real_estate" schema={schema} />;
};
