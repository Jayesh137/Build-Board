import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@buildtracker/db';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('DATABASE_URL not set — database queries will fail');
}

const client = connectionString ? postgres(connectionString) : null;
export const db = client ? drizzle(client, { schema }) : null;
