import type { DataProject } from "./types";

/**
 * Data engineering and research projects for the Data section.
 * Every data project must have a GitHub link and screenshots.
 * To add one (for example a health data or EHR project), append an object to this array.
 * Only use real, verifiable numbers in `metrics`.
 */

export const dataProjects: DataProject[] = [
  {
    slug: "biostreamer",
    name: "BioStreamer",
    featured: true,
    tagline: "My own peer-reviewed anaerobic digestion research, turned into a hybrid data platform.",
    summary:
      "BioStreamer models daily bioreactor telemetry (pH, volatile fatty acids, alkalinity and biogas yield) for 100 simulated reactor lines, grounded in the co-digestion study I co-authored. Structured data and research literature flow through separate pipelines and meet in one API.",
    highlights: [
      "Structured track: telemetry lands as Parquet in MinIO, then loads into PostgreSQL.",
      "Unstructured track: research literature is chunked, embedded and searchable through a RAG layer on Qdrant.",
      "Airflow DAGs orchestrate both tracks, with validation gates that fail closed unless reference reactors reproduce the study's published yields.",
      "A FastAPI hybrid endpoint combines SQL aggregates with vector search, explored in a Streamlit dashboard, and degrades gracefully when no language model key is set.",
    ],
    metrics: [
      { value: 0.042, decimals: 3, suffix: " ml/day", label: "Maximum deviation from published yields" },
      { value: 27000, prefix: "~", suffix: " rows/s", label: "Pipeline throughput on ~3,700 rows" },
      { value: 100, label: "Simulated bioreactor lines" },
    ],
    stack: [
      "Python",
      "Airflow",
      "PostgreSQL",
      "MinIO",
      "Parquet",
      "Qdrant",
      "FastAPI",
      "Streamlit",
      "Docker",
    ],
    links: [{ label: "View on GitHub", href: "https://github.com/jonascodes15/biostreamer", kind: "github" }],
    // TODO: add BioStreamer dashboard and Airflow pipeline-run screenshots to /public/projects/biostreamer/.
    screenshots: [],
    screenshotDir: "/projects/biostreamer",
  },
  {
    slug: "agropulse",
    name: "AgroPulse",
    tagline: "A precision agriculture data platform, from sensor stream to live dashboard.",
    summary:
      "Streams simulated soil moisture, canopy temperature, nitrogen and irrigation readings through Kafka (Redpanda) into TimescaleDB for real-time and historical analysis, with a nightly Airflow DAG that recomputes yield forecasts.",
    highlights: [
      "Nightly Airflow DAG recomputes yield forecasts from accumulated sensor data, with no manual runs.",
      "FastAPI serving layer feeds a React and TypeScript dashboard with live Recharts visualisations.",
      "All five services run with Docker Compose, so the whole stack starts with one command.",
    ],
    stack: [
      "Python",
      "Kafka (Redpanda)",
      "Airflow",
      "TimescaleDB",
      "FastAPI",
      "React",
      "TypeScript",
      "Docker",
    ],
    links: [
      { label: "View on GitHub", href: "https://github.com/jonascodes15/agropulse", kind: "github" },
      { label: "Live dashboard", href: "https://agropulsehq.netlify.app", kind: "live" },
    ],
    // TODO: add AgroPulse screenshots to /public/projects/agropulse/.
    screenshots: [],
    screenshotDir: "/projects/agropulse",
  },
  {
    slug: "bioflow-iot",
    name: "BioFlow IoT",
    tagline: "A real-time bioreactor telemetry pipeline.",
    summary:
      "Streams flow rate, temperature and pH readings from a Python simulator through Kafka into a normalised PostgreSQL schema with timestamp indexing, served by FastAPI to a React dashboard that polls every 1.5 seconds.",
    highlights: [
      "Timestamp-indexed PostgreSQL schema for efficient range queries.",
      "FastAPI endpoints for the 50 most recent records and the latest reading.",
      "Four-service stack (simulator, Kafka, consumer, API) containerised with Docker Compose.",
    ],
    stack: ["Python", "Kafka", "PostgreSQL", "FastAPI", "React", "Docker"],
    links: [{ label: "View on GitHub", href: "https://github.com/jonascodes15/bioflow_iot", kind: "github" }],
    // TODO: add BioFlow IoT screenshots to /public/projects/bioflow-iot/.
    screenshots: [],
    screenshotDir: "/projects/bioflow-iot",
  },
  {
    slug: "api-to-sql-etl",
    name: "API to SQL ETL Pipeline",
    tagline: "An idempotent, containerised ETL pipeline from a live REST API to SQL.",
    summary:
      "Extracts user profiles from a live REST API, flattens deeply nested JSON, standardises field formatting and loads clean records into a SQLite warehouse.",
    highlights: [
      "UPSERT logic (ON CONFLICT DO UPDATE) makes repeated runs safe, with no duplicate records.",
      "Three isolated phases (extract, transform, load) behind one entry point, each testable on its own.",
    ],
    stack: ["Python", "SQLite", "Docker"],
    links: [
      {
        label: "View on GitHub",
        href: "https://github.com/jonascodes15/api-to-sql-etl-pipeline",
        kind: "github",
      },
    ],
    // TODO: add API to SQL ETL screenshots to /public/projects/api-to-sql-etl/.
    screenshots: [],
    screenshotDir: "/projects/api-to-sql-etl",
  },
];

export function getDataProject(slug: string) {
  return dataProjects.find((p) => p.slug === slug);
}
