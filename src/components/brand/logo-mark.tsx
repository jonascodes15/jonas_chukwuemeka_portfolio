import { cn } from "@/lib/utils";

/**
 * The JC mark: a thin square frame whose left edge breaks for the initials, with the J's stem
 * sitting on that edge. Drawn as strokes in `currentColor`, so it follows the text colour.
 * The favicon files in src/app use a heavier version of the same drawing (see scripts/build-icons.mjs).
 */
export function LogoMark({
  className,
  title,
  strokeWidth = 1.5,
}: {
  className?: string;
  title?: string;
  /** In viewBox units (48 wide). Thinner reads more refined at large sizes. */
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {/* Frame: down the left edge from the gap, round the square, and a short return below the initials. */}
      <path d="M8 28.5V4h36v40H8v-3.5" />
      {/* J: stem on the frame's edge, hooking left. */}
      <path d="M8 31v5.25a2.6 2.6 0 0 1-5.2 0" />
      {/* C: open to the right. */}
      <path d="M18.1 32.4A3.9 3.9 0 1 0 18.1 37.6" />
    </svg>
  );
}
