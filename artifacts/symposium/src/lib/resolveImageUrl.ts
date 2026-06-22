const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

/**
 * Resolve a stored image value to a URL that can be used in an <img> src.
 * - External URLs (https://...) are returned as-is.
 * - Object storage paths (/objects/...) are proxied via the public media route.
 * - Null/undefined returns null.
 */
export function resolveImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/objects/")) {
    return `${BASE_URL}/api/media/objects/${value.slice("/objects/".length)}`;
  }
  return value;
}
