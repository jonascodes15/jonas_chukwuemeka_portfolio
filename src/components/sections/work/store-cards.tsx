import { ArrowUpRight } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Picture } from "@/components/ui/picture";
import type { Store } from "@/content/types";

/** Seller stores running on Weblanda, each linking to its live storefront. */
export function StoreCards({ stores }: { stores: Store[] }) {
  return (
    <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stores.map((store) => {
        const host = store.href ? new URL(store.href).host : null;
        const body = (
          <>
            <div
              className="relative grid aspect-[16/10] place-items-center overflow-hidden border-b border-border"
              style={{ backgroundColor: store.logo?.background }}
            >
              {store.logo ? (
                <Picture
                  base={store.logo.src}
                  widths={store.logo.widths}
                  width={store.logo.width}
                  height={store.logo.height}
                  alt={`${store.name} logo`}
                  sizes="240px"
                  className="w-[46%] max-w-[13rem] transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]"
                />
              ) : (
                <span className="font-display text-2xl font-bold">{store.name}</span>
              )}
            </div>
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <h4 className="font-display text-lg font-bold tracking-tight text-fg">{store.name}</h4>
                <p className="mt-1 text-sm text-muted">{store.description}</p>
                {host && <p className="mt-3 font-mono text-[0.7rem] text-accent-ink">{host}</p>}
              </div>
              {store.href && (
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-fg transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-contrast"
                >
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              )}
            </div>
          </>
        );

        return (
          <RevealItem as="li" key={store.name}>
            {store.href ? (
              <a
                href={store.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${store.name} (opens in a new tab)`}
                className="group block overflow-hidden rounded-card border border-border bg-surface transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-border-strong"
              >
                {body}
              </a>
            ) : (
              <div className="overflow-hidden rounded-card border border-border bg-surface">{body}</div>
            )}
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
