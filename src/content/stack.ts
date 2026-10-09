/**
 * Tools shown in the scrolling tech strip, in display order.
 * `icon` maps to a component in src/components/icons/tech-icon.tsx.
 */
export const techStack = [
  { name: "Next.js", icon: "nextjs" },
  { name: "React", icon: "react" },
  { name: "TypeScript", icon: "typescript" },
  { name: "Tailwind CSS", icon: "tailwind" },
  { name: "Node.js", icon: "nodejs" },
  { name: "PostgreSQL", icon: "postgresql" },
  { name: "MySQL", icon: "mysql" },
  { name: "Supabase", icon: "supabase" },
  { name: "Python", icon: "python" },
  { name: "Airflow", icon: "airflow" },
  { name: "Kafka", icon: "kafka" },
  { name: "FastAPI", icon: "fastapi" },
  { name: "Docker", icon: "docker" },
  { name: "Vercel", icon: "vercel" },
  { name: "Paystack", icon: "paystack" },
] as const;

export type TechIconKey = (typeof techStack)[number]["icon"];
