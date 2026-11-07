/** Share of `value` in `max` (0 when there is nothing to compare). */
export function ratio(value: number, max: number) {
  return max > 0 ? value / max : 0;
}

/** Largest value of a list, 0 for an empty one. */
export function maxOf(values: number[]) {
  return values.reduce((max, value) => Math.max(max, value), 0);
}
