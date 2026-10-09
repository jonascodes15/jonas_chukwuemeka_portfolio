import type { IconType } from "react-icons";
import {
  SiApacheairflow,
  SiApachekafka,
  SiDocker,
  SiFastapi,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import type { TechIconKey } from "@/content/stack";

// TODO: replace with the official Paystack mark from Paystack's brand assets.
// Simple stacked-bars glyph so the strip has an icon in the meantime.
const PaystackMark: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <rect x="2" y="3" width="20" height="3.2" rx="1.2" />
    <rect x="2" y="8.3" width="20" height="3.2" rx="1.2" />
    <rect x="2" y="13.6" width="11" height="3.2" rx="1.2" />
    <rect x="2" y="18.8" width="20" height="3.2" rx="1.2" />
  </svg>
);

const icons: Record<TechIconKey, IconType> = {
  nextjs: SiNextdotjs,
  react: SiReact,
  typescript: SiTypescript,
  tailwind: SiTailwindcss,
  nodejs: SiNodedotjs,
  postgresql: SiPostgresql,
  mysql: SiMysql,
  supabase: SiSupabase,
  python: SiPython,
  airflow: SiApacheairflow,
  kafka: SiApachekafka,
  fastapi: SiFastapi,
  docker: SiDocker,
  vercel: SiVercel,
  paystack: PaystackMark,
};

export function TechIcon({ name, className }: { name: TechIconKey; className?: string }) {
  const Icon = icons[name];
  return <Icon aria-hidden className={className} />;
}
