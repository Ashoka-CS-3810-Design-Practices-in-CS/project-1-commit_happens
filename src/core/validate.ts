/* Input validation helpers (A1 ER3: reject before anything reaches the model). */

/** Parse a required whole number; returns null when invalid. */
export function intOf(s: string | undefined): number | null {
  if (s == null || s.trim() === '') return null;
  const v = Number(s.trim());
  return Number.isInteger(v) ? v : null;
}

/** Vertex / node names: short alphanumeric identifiers. */
export function nameOf(s: string | undefined): string | null {
  const t = (s ?? '').trim().toUpperCase();
  return /^[A-Z0-9_]{1,4}$/.test(t) ? t : null;
}
