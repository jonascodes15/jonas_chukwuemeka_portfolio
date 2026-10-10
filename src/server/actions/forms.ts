"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { site } from "@/content/site";
import { getDb, schema } from "../db";
import { enquiryAutoReply, enquiryNotification, sendMail } from "../email";
import { ConfigError, requireEnv } from "../env";
import { startSubscription } from "../newsletter";
import { ipHash } from "../privacy";
import { rateLimit } from "../rate-limit";

/** Public form actions: contact enquiries and newsletter sign-up. */

export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

const fallback = `Something went wrong on my side. Please email ${site.email} or use WhatsApp instead.`;

const enquirySchema = z.object({
  type: z.enum(site.contact.enquiryTypes),
  name: z.string().trim().min(1, "Please tell me your name.").max(120),
  email: z.email("Please enter a valid email address.").max(200),
  budget: z
    .string()
    .optional()
    .transform((v) => (v && (site.contact.budgetRanges as readonly string[]).includes(v) ? v : null)),
  message: z
    .string()
    .trim()
    .min(10, "A sentence or two helps me reply properly.")
    .max(2000, "Please keep it under 2,000 characters."),
});

function firstErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

export async function sendEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: people never see this field. Pretend it worked so bots don't adapt.
  if (formData.get("website")) return { status: "success", message: "Thanks, your message has been sent." };

  const parsed = enquirySchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").trim(),
    budget: formData.get("budget") ?? undefined,
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: firstErrors(parsed.error),
    };
  }
  const data = { ...parsed.data, budget: parsed.data.type === "Project" ? parsed.data.budget : null };

  try {
    const db = getDb();
    if (!db) throw new ConfigError("DATABASE_URL");
    const h = await headers();
    const hash = ipHash(h);

    const limit = await rateLimit(`enquiry:${hash}`, 5, 60 * 60);
    if (!limit.ok) {
      return {
        status: "error",
        message: `You've sent a few messages already. Please try again later, or email ${site.email}.`,
      };
    }

    await db.insert(schema.enquiries).values({ ...data, ipHash: hash });

    // Emails go out after the response, so the visitor isn't kept waiting.
    // The enquiry is already saved, so nothing is lost if an email fails.
    after(async () => {
      try {
        await sendMail({ to: requireEnv("CONTACT_TO_EMAIL"), ...enquiryNotification(data) });
        await sendMail({ to: data.email, ...enquiryAutoReply(data.name) });
      } catch (err) {
        console.error("[enquiry] email failed", err);
      }
    });

    return {
      status: "success",
      message: "Thanks for reaching out. I've received your message and sent a copy to your inbox.",
    };
  } catch (err) {
    console.error("[enquiry]", err);
    return { status: "error", message: fallback };
  }
}

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("website")) return { status: "success", message: "Check your inbox to confirm." };

  const email = z
    .email()
    .max(200)
    .safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) return { status: "error", message: "Please enter a valid email address." };

  try {
    const hash = ipHash(await headers());
    const limit = await rateLimit(`subscribe:${hash}`, 5, 60 * 60);
    if (!limit.ok) return { status: "error", message: "Too many attempts. Please try again later." };

    const result = await startSubscription(email.data);
    return {
      status: "success",
      message:
        result === "already"
          ? "You're already subscribed. Thanks for reading."
          : "Almost done. Check your inbox and tap the link to confirm.",
    };
  } catch (err) {
    console.error("[subscribe]", err);
    return { status: "error", message: "Sign-up isn't working right now. Please try again later." };
  }
}
