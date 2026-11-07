import type { LabelCatalog, LabelMap } from "@/types/labels";
import type { SelectOption } from "@/helpers/select";

/** Label for a code; unknown codes fall back to the code itself. */
export function labelFrom(map: LabelMap | undefined, code: string | number) {
  if (!map) return String(code);
  const label = Array.isArray(map) ? map[Number(code)] : map[String(code)];
  return label ?? String(code);
}

/** Select options from a map, in the API's order. */
export function optionsFrom(map: LabelMap | undefined): SelectOption[] {
  if (!map) return [];
  return Object.entries(map).map(([value, label]) => ({ value, label }));
}

export function isKnownCode(map: LabelMap | undefined, code: string | null) {
  return Boolean(map && code !== null && code in map);
}

export function mapOf(catalog: LabelCatalog | undefined, name: string) {
  return catalog?.[name];
}

/** Label only when the catalog knows the code — never show a raw English code. */
export function knownLabelFrom(map: LabelMap | undefined, code: string) {
  return isKnownCode(map, code) ? labelFrom(map, code) : null;
}
