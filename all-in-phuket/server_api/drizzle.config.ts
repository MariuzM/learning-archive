import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

export default {
  schema: './src/db/_index.tables.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: { connectionString: process.env.DATABASE_URL as string },
} satisfies Config;
