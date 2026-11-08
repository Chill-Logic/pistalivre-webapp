import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import type { InspectionActor } from "@/types/inspection";
import type {
  InspectionRequirements as RentalInspectionRequirements,
  InspectionSubmitInput,
} from "@/types/portal";
import type { InspectionRequirements } from "@/types/template";

type LabelFn = (map: LabelMapName, code: string) => string;

/** Who did it, as the list shows it: "Agente · Ana" / "Locatário · João". */
export const INSPECTION_AUTHOR_PREFIX: Record<InspectionActor, string> = {
  LESSOR: "Agente",
  LESSEE: "Locatário",
};

export function inspectionAuthor(
  inspection: { performedBy: InspectionActor; performedByName: string | null },
  label: LabelFn,
) {
  return inspection.performedByName
    ? `${INSPECTION_AUTHOR_PREFIX[inspection.performedBy]} · ${inspection.performedByName}`
    : label(LABEL_MAPS.inspectionActor, inspection.performedBy);
}

/**
 * The photos and checks one vehicle type asks for (mileage is built in), in
 * the order set in Modelos › Vistoria. A type without requirements asks for
 * the km only.
 */
export function requirementsOfType(
  catalog: InspectionRequirements,
  vehicleTypeId: string,
): RentalInspectionRequirements {
  const entry = catalog.types.find((item) => item.type.id === vehicleTypeId);
  const pick = (items: InspectionRequirements["types"][number]["photos"]) =>
    [...items]
      .sort((a, b) => a.position - b.position)
      .map(({ key, label, required }) => ({ key, label, required }));
  return {
    photos: entry ? pick(entry.photos) : [],
    checks: entry ? pick(entry.checks) : [],
  };
}

/**
 * The multipart fields both inspection endpoints read: `type`, `mileage`,
 * `notes?`, a file per photo as `photo_<key>` and each OK check as
 * `check_<key>`. A KM reading takes no photos or checks.
 */
export function appendInspectionFields(
  body: FormData,
  input: InspectionSubmitInput,
) {
  body.append("type", input.type);
  body.append("mileage", String(input.mileage));
  if (input.notes) body.append("notes", input.notes);
  if (input.type === "FULL") {
    for (const [key, file] of Object.entries(input.photos)) {
      body.append(`photo_${key}`, file);
    }
    for (const key of input.checksOk) body.append(`check_${key}`, "true");
  }
  return body;
}
