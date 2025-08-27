import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Only require DATABASE_URL in production
let db: ReturnType<typeof drizzle>;
let pool: Pool | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // In development without database, create a placeholder
  // The actual storage will use in-memory implementation
  console.log("No DATABASE_URL found - using in-memory storage for development");
  db = null as any; // Will be handled by storage layer
}

export { pool, db };