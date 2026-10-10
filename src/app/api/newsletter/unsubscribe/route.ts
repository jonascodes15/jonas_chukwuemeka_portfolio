import { unsubscribeByToken } from "@/server/newsletter";

/** One-click unsubscribe (RFC 8058): mail apps POST here from their own "Unsubscribe" button. */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  await unsubscribeByToken(token);
  return new Response(null, { status: 200 });
}
