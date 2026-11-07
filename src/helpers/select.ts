export type SelectOption = { value: string; label: string };

/**
 * Radix Select reserves "" for "no value", so the "all" entry of a filter
 * uses a sentinel and is translated back to "" (= no filter) at the edge.
 */
const ALL = "__all__";

export function toSelectValue(value: string) {
  return value || ALL;
}

export function fromSelectValue(value: string) {
  return value === ALL ? "" : value;
}

export const ALL_SELECT_VALUE = ALL;
