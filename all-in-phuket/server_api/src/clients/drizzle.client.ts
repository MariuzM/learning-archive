import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../db/_index.tables';

const client = postgres(process.env.DATABASE_URL, {
  connect_timeout: 300,
  // connect_timeout: 10,
  // idle_timeout: 10,
  // debug: true,
});

export const db = drizzle(client, {
  // logger: true,
  schema: schema,
});
