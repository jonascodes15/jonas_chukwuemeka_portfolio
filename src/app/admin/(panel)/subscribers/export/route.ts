import { listSubscribers } from "@/server/admin-data";
import { isAdmin } from "@/server/auth";
import { getDb } from "@/server/db";

/** Subscribers as CSV (opens in Excel or Google Sheets). Admin only. */
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const db = getDb();
  if (!db) return new Response("Database not configured", { status: 503 });

  const status = new URL(request.url).searchParams.get("status") ?? "all";
  const rows = await listSubscribers(
    db,
    ["confirmed", "pending", "unsubscribed"].includes(status) ? status : "all",
    100_000,
  );

  // Quote every cell, and defuse values a spreadsheet would treat as formulas.
  const cell = (v: unknown) => {
    let s = v instanceof Date ? v.toISOString() : String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [
    ["email", "status", "signed_up", "confirmed_at", "unsubscribed_at"].join(","),
    ...rows.map((r) => [r.email, r.status, r.createdAt, r.confirmedAt, r.unsubscribedAt].map(cell).join(",")),
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${status}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
