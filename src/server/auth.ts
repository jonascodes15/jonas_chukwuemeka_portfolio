import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/** True when the request carries a valid admin session. */
export async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Call at the top of every admin page and admin server action. proxy.ts already redirects
 * signed-out visitors, but server actions are public endpoints, so each one checks again.
 */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
