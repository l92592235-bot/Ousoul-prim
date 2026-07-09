import { neon } from '@neondatabase/serverless';

// Use a placeholder connection string if env vars are missing so that the
// module can be safely imported during Next.js's build-time "collecting
// page data" step (which requires every API route module). Real requests
// will only ever run with the actual DATABASE_URL configured in the
// deployment environment; if it's genuinely missing at runtime, queries
// will fail with a connection error instead of crashing the build.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgres://placeholder:placeholder@localhost:5432/placeholder';

export const sql = neon(connectionString);
