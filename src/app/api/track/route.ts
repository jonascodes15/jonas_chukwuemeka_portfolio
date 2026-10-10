import { z } from "zod";
import { getDb, schema } from "@/server/db";
import { ipHash, isBot, parseUserAgent, visitorHash } from "@/server/privacy";
import { rateLimit } from "@/server/rate-limit";
import { IGNORE_COOKIE, SESSION_COOKIE } from "@/server/session";

/**
 * Collects first-party analytics from src/components/analytics/tracker.tsx.
 * Skips bots, the site owner (admin cookies) and anything that doesn't come from this site.
 * Always answers 204, so it never reveals why an event was dropped.
 */

const eventSchema = z.object({
  type: z.enum(["pageview", "click"]),
  path: z.string().startsWith("/").max(300),
  label: z.string().max(120).optional(),
  referrer: z.string().max(500).optional(),
});

const ok = () => new Response(null, { status: 204 });

function externalHost(referrer: string | undefined, ownHost: string) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host && host !== ownHost.replace(/^www\./, "") ? host : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const h = request.headers;
  const cookies = h.get("cookie") ?? "";
  const ua = h.get("user-agent");
  const host = new URL(request.url).hostname;
  const origin = h.get("origin");

  if (cookies.includes(`${IGNORE_COOKIE}=`) || cookies.includes(`${SESSION_COOKIE}=`)) return ok();
  if (isBot(ua)) return ok();
  if (origin && new URL(origin).hostname !== host) return ok();

  const db = getDb();
  if (!db || !process.env.IP_HASH_SALT) return ok();

  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return ok();
  }
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return ok();

  try {
    const limit = await rateLimit(`track:${ipHash(h)}`, 300, 10 * 60);
    if (!limit.ok) return ok();

    const e = parsed.data;
    const { device, browser, os } = parseUserAgent(ua ?? "");
    await db.insert(schema.events).values({
      type: e.type,
      path: e.path.split("?")[0].split("#")[0] || "/",
      label: e.type === "click" ? (e.label ?? null) : null,
      referrer: e.type === "pageview" ? externalHost(e.referrer, host) : null,
      visitorHash: visitorHash(h),
      country: h.get("x-vercel-ip-country") || null,
      device,
      browser,
      os,
    });
  } catch (err) {
    console.error("[track]", err);
  }
  return ok();
}
