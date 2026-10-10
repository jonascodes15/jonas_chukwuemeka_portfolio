import { cacheLife, cacheTag } from "next/cache";
import { getDb, schema } from "./db";

/** Site settings editable from /admin/settings. Cached, and refreshed when saved. */

export interface SiteSettings {
  availableForWork: boolean;
  /** Short line shown next to the badge, e.g. "Open to new projects". */
  availabilityLabel: string;
}

export const defaultSettings: SiteSettings = {
  availableForWork: true,
  availabilityLabel: "Open to new projects",
};

export const SETTINGS_TAG = "settings";

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(SETTINGS_TAG);

  const db = getDb();
  if (!db) return defaultSettings;
  try {
    const rows = await db.select().from(schema.settings);
    const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...defaultSettings, ...stored } as SiteSettings;
  } catch (err) {
    console.error("[settings]", err);
    return defaultSettings;
  }
}
