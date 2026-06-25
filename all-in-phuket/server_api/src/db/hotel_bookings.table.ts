import { bigint, bigserial, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { services_table } from './services.table';
import { users_table } from './users.table';

export const hotel_bookings_table = pgTable('hotel_bookings', {
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  userId: bigint('user_id', { mode: 'number' })
    .references(() => users_table.id)
    .notNull(),
  serviceId: bigint('service_id', { mode: 'number' })
    .references(() => services_table.id)
    .notNull(),

  bookingDate: timestamp('booking_date', { withTimezone: true, mode: 'string' }).notNull(),
  bookingStatus: text('booking_status').notNull(),
  specialRequest: text('special_request'),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});
