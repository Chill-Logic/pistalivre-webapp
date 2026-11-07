/** A real fleet vehicle in the scenario. Rent is R$/week; the rest R$/month. */
export type ProjectionRow = {
  id: string;
  /** Rented in the scenario (an idle one costs only its fixed costs). */
  active: boolean;
  rent: number;
  maint: number;
  suppliers: number;
  finance: number;
  /** Installments left (from the debt plan); null = the whole horizon. */
  financeMonths: number | null;
};

/** A hypothetical vehicle (fleet planning), possibly several of it. */
export type ProjectionExtra = Omit<ProjectionRow, "id"> & {
  label: string;
  qty: number;
};

/** The whole scenario — what `?sim=` encodes and the API computes. */
export type ProjectionState = {
  rent: number;
  maint: number;
  company: number;
  months: number;
  rows: ProjectionRow[];
  extras: ProjectionExtra[];
};

/** One line of the result (real vehicle or extra). */
export type ProjectionLine = {
  key: string;
  label: string;
  plate?: string;
  active: boolean;
  qty: number;
  rent: number;
  maint: number;
  suppliers: number;
  finance: number;
  financeMonths: number | null;
  revenue: number;
  maintenance: number;
  suppliersCost: number;
  financing: number;
  cost: number;
  result: number;
};

/** `projectOperation` from the domain: the API's numbers, never ours. */
export type ProjectionTotals = {
  months: number;
  real: ProjectionLine[];
  extra: ProjectionLine[];
  revenue: number;
  maintenance: number;
  suppliers: number;
  financing: number;
  company: number;
  costs: number;
  profit: number;
  margin: number;
};

export type ProjectionVehicle = {
  id: string;
  label: string;
  plate: string;
  rented: boolean;
};

export type ProjectionSeed = {
  vehicles: ProjectionVehicle[];
  defaults: { rent: number; maint: number; company: number; months: number };
  companySuppliersMonthly: number;
  companyDebtsMonthly: number;
  worstVehicle: {
    label: string;
    plate: string;
    totalCost: number;
    months: number;
  } | null;
  state: ProjectionState;
  sim: string;
  totals: ProjectionTotals;
};

export type ProjectionComputed = {
  state: ProjectionState;
  sim: string;
  totals: ProjectionTotals;
};
