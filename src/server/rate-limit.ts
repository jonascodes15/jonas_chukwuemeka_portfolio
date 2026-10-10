import "server-only";
import { sql } from "drizzle-orm";
import { getDb, type Db } from "./db";

/**
 * Fixed-window rate limit stored in Postgres, so it holds across serverless instances.
 * One atomic upsert per call: the counter resets when the window has passed.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number, db: Db | null = getDb()) {
  if (!db) return { ok: true, remaining: limit };

  const result = await db.execute<{ count: number }>(sql`
    insert into rate_limits (key, count, window_start)
    values (${key}, 1, now())
    on conflict (key) do update set
      count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
                   then 1 else rate_limits.count + 1 end,
      window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
                          then now() else rate_limits.window_start end
    returning count
  `);

  // Occasionally clear out stale windows so the table stays small.
  if (Math.random() < 0.02) {
    await db.execute(sql`delete from rate_limits where window_start < now() - interval '2 days'`);
  }

  const count = Number(result.rows[0]?.count ?? 0);
  return { ok: count <= limit, remaining: Math.max(0, limit - count) };
}
