import "server-only";
import { createHash } from "node:crypto";
import { requireEnv } from "./env";

/**
 * Privacy helpers. Raw IP addresses never leave this file: they are only ever hashed
 * together with IP_HASH_SALT, which is kept secret, so the hashes can't be reversed.
 */

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Client IP from the proxy headers Vercel sets. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip")?.trim() || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0"
  );
}

/** Stable salted hash of the IP, used for rate limiting and spam checks. */
export function ipHash(headers: Headers): string {
  return sha256(`${requireEnv("IP_HASH_SALT")}:ip:${clientIp(headers)}`);
}

/** Today's date in Lagos, e.g. "2026-10-10". Day boundaries for analytics use this zone. */
export function lagosDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(date);
}

/**
 * Anonymous visitor id for analytics: IP + user agent + day, salted and hashed.
 * It changes every day, so a visitor can be counted once per day but never followed over time.
 */
export function visitorHash(headers: Headers): string {
  const ua = headers.get("user-agent") ?? "";
  return sha256(`${requireEnv("IP_HASH_SALT")}:visitor:${lagosDay()}:${clientIp(headers)}:${ua}`);
}

const BOT_RE =
  /bot|crawl|spider|slurp|preview|fetch|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|httpclient|scrapy|facebookexternalhit|embedly|whatsapp|telegram|discord|vercel/i;

export function isBot(userAgent: string | null): boolean {
  return !userAgent || userAgent.length < 20 || BOT_RE.test(userAgent);
}

/** Coarse device, browser and OS from the user agent. No fingerprinting beyond this. */
export function parseUserAgent(ua: string) {
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua)
    ? "tablet"
    : /mobi|iphone|android/i.test(ua)
      ? "mobile"
      : "desktop";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /firefox|fxios/i.test(ua)
          ? "Firefox"
          : /chrome|crios/i.test(ua)
            ? "Chrome"
            : /safari/i.test(ua)
              ? "Safari"
              : "Other";
  const os = /windows/i.test(ua)
    ? "Windows"
    : /iphone|ipad|ios/i.test(ua)
      ? "iOS"
      : /mac os/i.test(ua)
        ? "macOS"
        : /android/i.test(ua)
          ? "Android"
          : /linux/i.test(ua)
            ? "Linux"
            : "Other";
  return { device, browser, os };
}
