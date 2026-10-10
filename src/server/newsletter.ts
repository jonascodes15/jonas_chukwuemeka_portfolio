import "server-only";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { site } from "@/content/site";
import { getDb, schema } from "./db";
import { confirmSubscription, sendMail } from "./email";

const { subscribers } = schema;

export const newToken = () => randomBytes(24).toString("base64url");

export const confirmUrl = (token: string) => `${site.url}/newsletter/confirm?token=${token}`;
export const unsubscribeUrl = (token: string) => `${site.url}/newsletter/unsubscribe?token=${token}`;
export const oneClickUnsubscribeUrl = (token: string) =>
  `${site.url}/api/newsletter/unsubscribe?token=${token}`;

/**
 * Double opt-in: a new or returning email gets a pending row and a confirmation email.
 * Already-confirmed emails are left alone (no second email, no hint either way).
 */
export async function startSubscription(rawEmail: string): Promise<"sent" | "already"> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");
  const email = rawEmail.trim().toLowerCase();

  const [existing] = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
  if (existing?.status === "confirmed") return "already";

  const token = newToken();
  if (existing) {
    await db
      .update(subscribers)
      .set({ status: "pending", token, unsubscribedAt: null })
      .where(eq(subscribers.id, existing.id));
  } else {
    await db.insert(subscribers).values({ email, token, status: "pending" });
  }
  await sendMail({ to: email, ...confirmSubscription(confirmUrl(token)) });
  return "sent";
}

export async function confirmByToken(token: string) {
  const db = getDb();
  if (!db || !token) return false;
  const rows = await db
    .update(subscribers)
    .set({ status: "confirmed", confirmedAt: new Date(), unsubscribedAt: null })
    .where(eq(subscribers.token, token))
    .returning({ id: subscribers.id });
  return rows.length > 0;
}

export async function unsubscribeByToken(token: string) {
  const db = getDb();
  if (!db || !token) return false;
  const rows = await db
    .update(subscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(subscribers.token, token))
    .returning({ id: subscribers.id });
  return rows.length > 0;
}
