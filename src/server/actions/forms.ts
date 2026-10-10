"use server";

import { site } from "@/content/site";

/**
 * Form actions for the contact and newsletter forms.
 * Phase 2 placeholders: the UI is complete, but nothing is stored or emailed yet.
 * Phase 4 replaces these with Zod validation, rate limiting, Neon storage and Resend email.
 */

export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export async function sendEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("website")) return { status: "success", message: "Thanks, your message has been sent." };

  return {
    status: "error",
    message: `The contact form isn't connected yet. Please email ${site.email} or use WhatsApp for now.`,
  };
}

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("website")) return { status: "success", message: "Check your inbox to confirm." };

  return { status: "error", message: "Sign-ups open soon. Thanks for your interest." };
}
