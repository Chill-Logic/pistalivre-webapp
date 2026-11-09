import type { RatePeriod } from "@/types/rental";
import type { DocumentFile } from "@/types/document";

export type VehicleStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE";

type Ref = { id: string; name: string };
type SluggedRef = Ref & { slug: string };

export type VehicleType = SluggedRef;

export type ActiveRental = {
  id: string;
  code: string;
  customer: Ref;
};

/** A partner on the vehicle's papers; null = the company. */
export type VehiclePartnerRef = { partnerId: string; name: string };

export type Vehicle = {
  id: string;
  plate: string;
  type: VehicleType;
  brand: Ref;
  model: Ref;
  year: number;
  category: SluggedRef;
  color: string | null;
  chassis: string;
  renavam: string;
  status: VehicleStatus;
  /** Latest reading across inspections and maintenances. */
  currentMileage: number | null;
  activeRental: ActiveRental | null;
  /** In whose name the document is (null = the company). */
  titleHolder: VehiclePartnerRef | null;
  /** Whose vehicle it is (null = the company). */
  owner: VehiclePartnerRef | null;
  createdAt: string;
  updatedAt: string;
};

export type VehicleDetail = Vehicle & {
  documents: DocumentFile[];
  /** Legacy tariff, still required by the vehicle form (price lives on Rental). */
  rate: number;
  ratePeriod: RatePeriod;
  /** Fixed costs ("Custos fixos", VEHICLE scope) linked to this vehicle. */
  suppliers?: VehicleSupplierLink[];
};

/** A fixed cost linked to a vehicle, with the amount PER vehicle. */
export type VehicleSupplierLink = {
  linkId: string;
  supplier: Ref;
  monthlyAmount: number;
  active: boolean;
};

export type VehicleFormOptions = {
  types: VehicleType[];
  categories: (SluggedRef & { typeId: string })[];
  brands: Ref[];
  models: (Ref & { brandId: string })[];
  years: number[];
};

/** Body of POST/PUT /vehicles. Brand and model go by NAME (find-or-create). */
export type VehicleInput = {
  plate: string;
  brand: string;
  model: string;
  year: number;
  categoryId: string;
  color: string | null;
  chassis: string;
  renavam: string;
  rate: number;
  ratePeriod: RatePeriod;
  /** null = the company. */
  titleHolderPartnerId: string | null;
  /** null = the company. */
  ownerPartnerId: string | null;
};

export type VehicleFilters = {
  page: number;
  pageSize: number;
  q: string;
  type: string;
  status: VehicleStatus | "";
  /** "company" or a partner id; absent = any owner. */
  owner?: string;
};

/** Body of POST/PUT /vehicles and PATCH /vehicles/:id/status: no `documents`. */
export type VehicleWrite = Omit<VehicleDetail, "documents">;
