export type RealEstate = {
  id: number;
  serviceId: number;

  name: string;
  images?: string[] | null;
  location: string;
  price: number;
  description: string;

  amenities?: string[] | null;
  availabilityType: string;
  contractDuration: string;
  bedroomCount: number;
  showerCount: number;
  ownershipStatus: string;
  propertyType: string;
};
