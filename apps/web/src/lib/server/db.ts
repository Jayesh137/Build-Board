import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@buildtracker/db';
import { env } from '$env/dynamic/private';

const connectionString = env.DATABASE_URL || '';
const client = connectionString
  ? postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    })
  : null;
export const db = client ? drizzle(client, { schema }) : null;
