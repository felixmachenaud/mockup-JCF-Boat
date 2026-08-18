/** True when a CMS image path/URL is safe for next/image. */
export function isCmsImageSrc(src: string | undefined | null): src is string {
  const value = src?.trim() ?? "";
  return (
    value.startsWith("/") ||
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}
