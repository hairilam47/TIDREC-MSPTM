/**
 * Resolve a stored image value to a URL that can be used in an <img> src.
 * - External URLs (https://...) are returned as-is.
 * - Object storage paths (/objects/...) are proxied via the public media route.
 * - Null/undefined returns null.
 *
 * NOTE: Always uses absolute /api path — this file is shared across apps with
 * different BASE_PATH values (symposium at /, admin portal at /admin/).
 */
export function resolveImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/objects/")) {
    return `/api/media/objects/${value.slice("/objects/".length)}`;
  }
  return value;
}
