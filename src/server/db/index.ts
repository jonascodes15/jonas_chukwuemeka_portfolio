import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { optionalEnv } from "../env";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

function createDb(url: string) {
  return drizzle(neon(url), { schema });
}

let db: Db | null = null;

/** The database client, or null when DATABASE_URL isn't set (pages then show a setup notice). */
export function getDb(): Db | null {
  if (db) return db;
  const url = optionalEnv("DATABASE_URL");
  if (!url) return null;
  db = createDb(url);
  return db;
}

export { schema };
