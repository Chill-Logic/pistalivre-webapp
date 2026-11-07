import { useCallback } from "react";
import type { LabelMapName } from "@/constants/label-maps";
import { useLabelCatalog } from "@/hooks/api/labels/useLabelCatalog";
import { labelFrom, mapOf, optionsFrom } from "@/helpers/labels";

/**
 * Portuguese labels for domain codes, from the API catalog. The shell only
 * renders after the catalog loads, so codes never flash on screen.
 */
export function useLabels() {
  const { data } = useLabelCatalog();

  const label = useCallback(
    (map: LabelMapName, code: string | number) =>
      labelFrom(mapOf(data, map), code),
    [data],
  );

  const options = useCallback(
    (map: LabelMapName) => optionsFrom(mapOf(data, map)),
    [data],
  );

  const map = useCallback((name: LabelMapName) => mapOf(data, name), [data]);

  return { label, options, map };
}
