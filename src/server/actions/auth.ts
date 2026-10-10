"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { optionalEnv } from "../env";
import { ipHash } from "../privacy";
import { rateLimit } from "../rate-limit";
import { createSessionToken, IGNORE_COOKIE, SESSION_COOKIE, SESSION_DAYS } from "../session";

/** `email` is sent back so the form can keep it after a failed attempt. */
export type LoginState = { error?: string; email?: string };

// Compared against when the email is wrong, so a wrong email takes as long as a wrong password.
let dummyHash: string | null = null;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash("not-the-admin-password", 12));

const digest = (s: string) => createHash("sha256").update(s).digest();

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const adminEmail = optionalEnv("ADMIN_EMAIL")?.toLowerCase();
  const adminHash = optionalEnv("ADMIN_PASSWORD_HASH");
  if (!adminEmail || !adminHash || !optionalEnv("SESSION_SECRET")) {
    return {
      error: "Admin login isn't set up yet. Add ADMIN_EMAIL, ADMIN_PASSWORD_HASH and SESSION_SECRET.",
    };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const h = await headers();
  try {
    const limit = await rateLimit(`login:${ipHash(h)}`, 5, 15 * 60);
    if (!limit.ok) return { error: "Too many attempts. Wait 15 minutes and try again.", email };
  } catch (err) {
    console.error("[login] rate limit unavailable", err);
    return { error: "Login is unavailable right now. Check DATABASE_URL and IP_HASH_SALT.", email };
  }

  const password = String(formData.get("password") ?? "");
  const emailOk = timingSafeEqual(digest(email), digest(adminEmail));
  const passwordOk = await bcrypt.compare(password, emailOk ? adminHash : await getDummyHash());
  if (!emailOk || !passwordOk) return { error: "That email and password don't match.", email };

  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  jar.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  jar.set(IGNORE_COOKIE, "1", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
