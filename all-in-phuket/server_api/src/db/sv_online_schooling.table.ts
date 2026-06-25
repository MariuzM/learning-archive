import { bigint, bigserial, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { services_table } from './services.table';

export const sv_online_schooling_table = pgTable('sv_online_schooling', {
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  serviceId: bigint('service_id', { mode: 'number' })
    .references(() => services_table.id)
    .notNull(),

  name: text('name').unique().notNull(),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});
