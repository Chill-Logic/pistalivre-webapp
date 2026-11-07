/**
 * Build query params for the API, dropping empty values so the URL only
 * carries real filters (`?q=&status=` would be noise in logs and cache keys).
 */
export function toQueryParams(
  values: Record<string, string | number | null | undefined>,
) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );
}
