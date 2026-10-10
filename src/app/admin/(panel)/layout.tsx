import { ArrowUpRight, LogOut } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav, AdminNavLinks } from "@/components/admin/admin-nav";
import { LogoMark } from "@/components/brand/logo-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { logout } from "@/server/actions/auth";
import { getDb } from "@/server/db";
import { statusCounts } from "@/server/admin-data";
import { isAdmin } from "@/server/auth";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur lg:h-dvh lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col gap-3 px-3 py-3 lg:gap-6 lg:px-4 lg:py-6">
          <div className="flex items-center justify-between px-1">
            <Link href="/admin" className="flex items-center gap-2.5">
              <LogoMark className="size-8 text-accent-ink" />
              <span className="font-display font-bold tracking-tight text-fg">Dashboard</span>
            </Link>
            <div className="flex items-center gap-1 lg:hidden">
              <ThemeToggle />
              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Log out"
                  className="grid size-10 place-items-center rounded-full border border-border text-muted hover:text-fg"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>

          <Suspense fallback={<AdminNavLinks pathname={null} />}>
            <AdminNav
              badges={{
                enquiries: (
                  <Suspense>
                    <UnreadBadge />
                  </Suspense>
                ),
              }}
            />
          </Suspense>

          <div className="mt-auto hidden space-y-1 lg:block">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2/60 hover:text-fg"
            >
              <ArrowUpRight aria-hidden className="size-4" />
              View site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2/60 hover:text-fg"
              >
                <LogOut aria-hidden className="size-4" />
                Log out
              </button>
            </form>
            <div className="px-1 pt-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

async function UnreadBadge() {
  if (!(await isAdmin())) return null;
  const db = getDb();
  if (!db) return null;
  const n = (await statusCounts(db, "enquiries")).new ?? 0;
  if (!n) return null;
  return (
    <span className="ml-auto rounded-pill bg-accent px-1.5 py-0.5 font-mono text-[0.65rem] leading-none text-accent-contrast">
      {n}
    </span>
  );
}
