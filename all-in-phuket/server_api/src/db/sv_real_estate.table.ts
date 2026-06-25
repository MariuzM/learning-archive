import { bigint, bigserial, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import {
  amenitiesArr,
  availabilityTypeArr,
  contractDurationArr,
  ownershipStatusArr,
  propertyTypeArr,
} from '../data/sv_real_estate.data';

import { services_table } from './services.table';

// ==================================================================

export const AvailabilityTypeE = pgEnum('availability_type', availabilityTypeArr).enumValues;
export const ContractDurationE = pgEnum('contract_duration', contractDurationArr).enumValues;
export const OwnershipStatusE = pgEnum('ownership_status', ownershipStatusArr).enumValues;
export const PropertyTypeE = pgEnum('property_type', propertyTypeArr).enumValues;
export const AmenitiesE = pgEnum('amenities', amenitiesArr).enumValues;

// ==================================================================

export const sv_real_estate_table = pgTable('sv_real_estate', {
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  serviceId: bigint('service_id', { mode: 'number' })
    .references(() => services_table.id)
    .notNull(),

  name: text('name').notNull(),
  images: text('images').array(),
  location: text('location').notNull(),
  price: bigint('price', { mode: 'number' }).notNull(),
  description: text('description').notNull(),

  amenities: text('amenities', { enum: AmenitiesE }).array(),
  availabilityType: text('availability_type', { enum: AvailabilityTypeE }).notNull(),
  contractDuration: text('contract_duration', { enum: ContractDurationE }).notNull(),
  bedroomCount: bigint('bedroom_count', { mode: 'number' }).notNull(),
  showerCount: bigint('shower_count', { mode: 'number' }).notNull(),
  ownershipStatus: text('ownership_status', { enum: OwnershipStatusE }).notNull(),
  propertyType: text('property_type', { enum: PropertyTypeE }).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

export type SvRealEstate = typeof sv_real_estate_table.$inferSelect;
