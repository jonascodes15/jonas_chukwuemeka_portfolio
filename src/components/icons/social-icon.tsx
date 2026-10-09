import { FaLinkedin } from "react-icons/fa6";
import { SiFacebook, SiGithub, SiWhatsapp, SiX } from "react-icons/si";
import type { SocialKey } from "@/content/types";

const icons = {
  linkedin: FaLinkedin,
  github: SiGithub,
  x: SiX,
  facebook: SiFacebook,
  whatsapp: SiWhatsapp,
} as const;

export function SocialIcon({ name, className }: { name: SocialKey | "whatsapp"; className?: string }) {
  const Icon = icons[name];
  return <Icon aria-hidden className={className} />;
}
