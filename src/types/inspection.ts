import type { DocumentFile } from "@/types/document";
import type { InspectionSubmitInput } from "@/types/portal";

export type InspectionType = "FULL" | "KM";
export type InspectionActor = "LESSOR" | "LESSEE";

export type InspectionListItem = {
  id: string;
  type: InspectionType;
  performedBy: InspectionActor;
  /** The agent who did it, or the renter (null on old records). */
  performedByName: string | null;
  mileage: number | null;
  /** How many photos were attached. */
  photos: number;
  createdAt: string;
  vehicle: { id: string; plate: string; label: string };
  rental: { id: string; code: string } | null;
};

export type InspectionPhoto = {
  key: string;
  label: string;
  document: DocumentFile | null;
};

export type InspectionCheck = {
  key: string;
  label: string;
  ok: boolean | null;
  note: string | null;
};

export type InspectionFilters = {
  page: number;
  pageSize: number;
  q: string;
  type: InspectionType | "";
  performedBy: InspectionActor | "";
  /** Scope to one vehicle or rental (detail-page sections). */
  vehicleId?: string;
  rentalId?: string;
};

export type InspectionDetail = {
  id: string;
  type: InspectionType;
  performedBy: InspectionActor;
  performedByName: string | null;
  mileage: number | null;
  notes: string | null;
  createdAt: string;
  vehicle: { id: string; plate: string; label: string };
  rental: {
    id: string;
    code: string;
    customer: { id: string; name: string };
  } | null;
  photos: InspectionPhoto[];
  checks: InspectionCheck[];
};

/**
 * POST /inspections (management): the same body as the portal's, plus the
 * vehicle, the optional rental (must be this vehicle's) and who did it.
 */
export type InspectionCreateInput = InspectionSubmitInput & {
  vehicleId: string;
  rentalId?: string;
  performedBy: InspectionActor;
};
