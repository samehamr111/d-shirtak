import { useState, type ImgHTMLAttributes } from "react";
import { ShirtMark } from "./ShirtMark";

interface ImageOrPlaceholderProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> {
  src?: string | null;
  alt: string;
  /** Applied to both the real <img> and the placeholder container, so the slot is always the
   *  same size/shape whether or not an image ends up rendering. */
  className?: string;
  iconClassName?: string;
}

/** Every image slot in the storefront should show *something* -- either the real image, or this
 *  branded placeholder -- never an empty box. Covers both cases that used to fall through with
 *  nothing rendered: no URL at all, and a URL that 404s/fails to load (there was previously no
 *  `onError` handling anywhere in the app). */
export function ImageOrPlaceholder({
  src,
  alt,
  className = "",
  iconClassName = "h-1/3 w-1/3 text-ink/25",
  ...imgProps
}: ImageOrPlaceholderProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPlaceholder = !src || failedSrc === src;

  if (showPlaceholder) {
    return (
      <div className={`flex items-center justify-center bg-ink/5 ${className}`}>
        <ShirtMark className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailedSrc(src)}
      decoding="async"
      className={className}
      {...imgProps}
    />
  );
}
