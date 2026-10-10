import "server-only";
import { Resend } from "resend";
import { site } from "@/content/site";
import { requireEnv } from "./env";

/**
 * Email through Resend. RESEND_FROM_EMAIL must be on a domain verified in Resend,
 * e.g. "Jonas Chukwuemeka <hello@jonaschukwuemeka.com>".
 */

let client: Resend | null = null;
function resend() {
  client ??= new Resend(requireEnv("RESEND_API_KEY"));
  return client;
}

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

const from = () => requireEnv("RESEND_FROM_EMAIL");

export async function sendMail(mail: Mail) {
  const { error } = await resend().emails.send({ from: from(), ...mail });
  if (error) throw new Error(`Resend: ${error.message}`);
}

/** Sends up to 100 emails per request. Returns how many failed. */
export async function sendBatch(mails: Mail[]): Promise<number> {
  let failed = 0;
  for (let i = 0; i < mails.length; i += 100) {
    const chunk = mails.slice(i, i + 100);
    const { error } = await resend().batch.send(chunk.map((m) => ({ from: from(), ...m })));
    if (error) failed += chunk.length;
  }
  return failed;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text to HTML paragraphs, with bare links made clickable. */
export function textToHtml(text: string) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((para) => {
      const html = escapeHtml(para)
        .replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}" style="color:#4a6600">${url}</a>`)
        .replace(/\n/g, "<br>");
      return `<p style="margin:0 0 16px">${html}</p>`;
    })
    .join("");
}

function layout(content: string, footer = "") {
  return `<!doctype html>
<html><body style="margin:0;background:#f5f5f0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#121211">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e0e0d7">
        <tr><td style="height:6px;background:#c6f432;border-radius:16px 16px 0 0"></td></tr>
        <tr><td style="padding:32px 32px 16px;font-size:15px;line-height:1.6">${content}</td></tr>
        <tr><td style="padding:0 32px 28px;font-size:12px;line-height:1.5;color:#5b5b55">
          ${site.name} · <a href="${site.url}" style="color:#5b5b55">${site.url.replace(/^https?:\/\//, "")}</a>${footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;background:#c6f432;color:#0e0e0d;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${label}</a></p>`;

export function enquiryNotification(e: {
  type: string;
  name: string;
  email: string;
  budget?: string | null;
  message: string;
}): Omit<Mail, "to"> {
  const rows = [
    ["Type", e.type],
    ["Name", e.name],
    ["Email", e.email],
    ...(e.budget ? [["Budget", e.budget]] : []),
  ];
  return {
    subject: `New enquiry (${e.type}) from ${e.name}`,
    replyTo: e.email,
    html: layout(`
      <h1 style="font-size:20px;margin:0 0 16px">New enquiry</h1>
      <table role="presentation" style="font-size:14px;margin-bottom:16px">
        ${rows.map(([k, v]) => `<tr><td style="color:#5b5b55;padding:2px 16px 2px 0">${k}</td><td>${escapeHtml(v)}</td></tr>`).join("")}
      </table>
      ${textToHtml(e.message)}
      ${button(`${site.url}/admin/enquiries`, "Open in dashboard")}
      <p style="font-size:13px;color:#5b5b55">Reply to this email to answer ${escapeHtml(e.name)} directly.</p>`),
    text: `New enquiry\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${e.message}\n\n${site.url}/admin/enquiries`,
  };
}

export function enquiryAutoReply(name: string): Omit<Mail, "to"> {
  const first = name.split(/\s+/)[0];
  const body = `Hi ${first},\n\nThanks for getting in touch. Your message reached me and I'll reply as soon as I can.\n\nIf it's urgent, you can also reach me on WhatsApp: https://wa.me/${site.whatsapp.number}\n\nJay`;
  return {
    subject: "Thanks for your message",
    html: layout(textToHtml(body)),
    text: body,
  };
}

export function confirmSubscription(confirmUrl: string): Omit<Mail, "to"> {
  return {
    subject: `Confirm your subscription to ${site.newsletter.heading}`,
    html: layout(`
      <h1 style="font-size:20px;margin:0 0 12px">One more step</h1>
      <p style="margin:0 0 8px">Tap the button to confirm you want occasional notes from me on what I'm building and learning.</p>
      ${button(confirmUrl, "Confirm subscription")}
      <p style="font-size:13px;color:#5b5b55">If you didn't sign up, ignore this email and you won't hear from me.</p>`),
    text: `Confirm your subscription: ${confirmUrl}\n\nIf you didn't sign up, ignore this email.`,
  };
}

/**
 * `unsubscribeUrl` is the page people click in the footer; `oneClickUrl` is the endpoint mail
 * apps POST to from their own "Unsubscribe" button (RFC 8058).
 */
export function newsletterEmail(
  subject: string,
  body: string,
  unsubscribeUrl: string,
  oneClickUrl: string,
): Omit<Mail, "to"> {
  return {
    subject,
    html: layout(textToHtml(body), ` · <a href="${unsubscribeUrl}" style="color:#5b5b55">Unsubscribe</a>`),
    text: `${body}\n\n---\nUnsubscribe: ${unsubscribeUrl}`,
    headers: {
      "List-Unsubscribe": `<${oneClickUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
