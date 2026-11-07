import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import type { MaintenanceListItem } from "@/types/maintenance";

type LabelFn = (map: LabelMapName, code: string) => string;

/** Service names, with the spec when there is one ("Fluidos: Óleo 20w50"). */
export function serviceLines(
  maintenance: Pick<MaintenanceListItem, "services" | "serviceDetails">,
  label: LabelFn,
) {
  return maintenance.services.map((code) => {
    const name = label(LABEL_MAPS.maintenanceService, code);
    const detail = maintenance.serviceDetails?.[code]?.trim();
    return { code, text: detail ? `${name}: ${detail}` : name };
  });
}
