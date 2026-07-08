import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL / POSTGRES_URL is not set');
}

export const sql = neon(connectionString);
