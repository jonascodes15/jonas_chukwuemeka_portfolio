"use server";

import { redirect } from "next/navigation";
import { confirmByToken, unsubscribeByToken } from "../newsletter";

/**
 * The links in emails open a page with a button rather than acting on GET, so email
 * security scanners that pre-open links can't confirm or unsubscribe anyone by accident.
 */

export async function confirmAction(formData: FormData) {
  const ok = await confirmByToken(String(formData.get("token") ?? ""));
  redirect(`/newsletter/confirm?status=${ok ? "done" : "invalid"}`);
}

export async function unsubscribeAction(formData: FormData) {
  const ok = await unsubscribeByToken(String(formData.get("token") ?? ""));
  redirect(`/newsletter/unsubscribe?status=${ok ? "done" : "invalid"}`);
}
