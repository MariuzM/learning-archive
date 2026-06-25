import { bigserial, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { sv_activities_table } from './sv_activities.table';
import { sv_diving_table } from './sv_diving.table';
import { sv_house_services_table } from './sv_house_services.table';
import { sv_legal_visa_services_table } from './sv_legal_visa_services.table';
import { sv_online_schooling_table } from './sv_online_schooling.table';
import { sv_real_estate_table } from './sv_real_estate.table';
import { sv_tours_table } from './sv_tours.table';
import { sv_vehicles_table } from './sv_vehicles.table';
import { sv_yacht_rental_table } from './sv_yacht_rental.table';

// ==================================================================

export const ServicesE = pgEnum('services', [
  'activities',
  'diving',
  'house_services',
  'legal_visa_services',
  'online_schooling',
  'real_estate',
  'tours',
  'vehicles',
  'yacht_rental',
]).enumValues;

export type ServicesT = (typeof ServicesE)[number];

// ==================================================================

export const services_table = pgTable('services', {
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),

  name: text('name', { enum: ServicesE }).unique().notNull(),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ==================================================================

export const svsTablesMap: Record<ServicesT, any> = {
  activities: sv_activities_table,
  diving: sv_diving_table,
  house_services: sv_house_services_table,
  legal_visa_services: sv_legal_visa_services_table,
  online_schooling: sv_online_schooling_table,
  real_estate: sv_real_estate_table,
  tours: sv_tours_table,
  vehicles: sv_vehicles_table,
  yacht_rental: sv_yacht_rental_table,
};
