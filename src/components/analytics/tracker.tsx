"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * First-party analytics. Sends a page view on every route change and a click event for:
 * - any element with data-track="label"
 * - links to other sites ("outbound:host"), email ("email"), phone, WhatsApp and file downloads
 * Events go to /api/track with sendBeacon, so they never slow down navigation.
 */

type Payload = { type: "pageview" | "click"; path: string; label?: string; referrer?: string };

function beacon(payload: Payload) {
  if (navigator.webdriver) return;
  const body = JSON.stringify(payload);
  const blob = new Blob([body], { type: "application/json" });
  if (navigator.sendBeacon && navigator.sendBeacon("/api/track", blob)) return;
  fetch("/api/track", {
    method: "POST",
    body,
    keepalive: true,
    headers: { "content-type": "application/json" },
  }).catch(() => {});
}

function labelFor(el: Element): string | null {
  const tagged = el.closest("[data-track]");
  if (tagged) return tagged.getAttribute("data-track");

  const link = el.closest("a[href]") as HTMLAnchorElement | null;
  if (!link) return null;
  const href = link.getAttribute("href") ?? "";
  if (href.startsWith("mailto:")) return "email";
  if (href.startsWith("tel:")) return "phone";
  if (link.hasAttribute("download")) return `download:${href.split("/").pop()}`;
  try {
    const url = new URL(link.href);
    if (url.hostname === "wa.me") return "whatsapp";
    if (url.origin !== location.origin) return `outbound:${url.hostname.replace(/^www\./, "")}`;
  } catch {
    return null;
  }
  return null;
}

export function Tracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    // The external referrer only matters on the first page of a visit.
    beacon({ type: "pageview", path: pathname, referrer: first.current ? document.referrer : undefined });
    first.current = false;
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const label = labelFor(e.target);
      if (label) beacon({ type: "click", path: location.pathname, label: label.slice(0, 120) });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
