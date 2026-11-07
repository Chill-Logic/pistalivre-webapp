import type { SelectOption } from "@/helpers/select";

/** Same text ignoring case and accents ("Citroën" = "citroen"). */
export function sameText(a: string, b: string) {
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
  return normalize(a) === normalize(b);
}

/**
 * Whether the typed text deserves a "create" entry: non-empty and not already
 * one of the options (the API find-or-creates by slug, so "toyota" = "Toyota").
 */
export function canCreateOption(query: string, options: SelectOption[]) {
  const text = query.trim();
  return (
    text.length > 0 && !options.some((option) => sameText(option.label, text))
  );
}
