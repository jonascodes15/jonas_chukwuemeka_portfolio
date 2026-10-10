import { cn } from "@/lib/utils";

const srcSet = (base: string, widths: number[], ext: "avif" | "webp") =>
  widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");

/**
 * Serves pre-optimised AVIF/WebP files (`<base>-<width>.<ext>`) through a plain <picture>.
 * next/image would re-encode files that are already optimised, so it's only used for the photos.
 */
export function Picture({
  base,
  widths,
  width,
  height,
  alt,
  sizes,
  eager = false,
  className,
  imgClassName,
}: {
  /** Path without the width and extension, e.g. "/projects/weblanda/screen-orders". */
  base: string;
  widths: number[];
  width: number;
  height: number;
  alt: string;
  /** How wide the image renders, e.g. "(min-width: 1024px) 560px, 90vw". */
  sizes: string;
  eager?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  const fallback = widths.find((w) => w >= 800) ?? widths[widths.length - 1];
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(base, widths, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(base, widths, "webp")} sizes={sizes} />
      <img
        src={`${base}-${fallback}.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={cn("block h-auto w-full", imgClassName)}
      />
    </picture>
  );
}
