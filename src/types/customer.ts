import type { DocumentFile } from "@/types/document";
import type { RentalListItem } from "@/types/rental";

export type CustomerStatus = "PROSPECT" | "ACTIVE";

export type CustomerListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  /** CPF as the API sends it (may be masked). */
  document: string;
  status: CustomerStatus;
  isTest: boolean;
  /** Has a linked Asaas customer (billing/NF ready). */
  asaasLinked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

/** A customer that exists only in Asaas (can be imported). */
export type AsaasOnlyCustomer = {
  /** Asaas id (cus_…). */
  id: string;
  name: string;
  document: string;
  email: string | null;
  phone: string | null;
};

/** Same CPF here and in Asaas, not linked yet (one click to link). */
export type AsaasReconcilable = {
  customerId: string;
  customerName: string;
  document: string;
  asaasCustomerId: string;
};

/** GET /customers/asaas-directory (Asaas down → empty lists + `error`). */
export type AsaasDirectory = {
  asaasOnly: AsaasOnlyCustomer[];
  reconcilable: AsaasReconcilable[];
  /** CPFs (digits only) present on both sides: the "Em ambos" tag. */
  inBothDocuments: string[];
  error: string | null;
};

/** The Asaas tag of a customer in the list. */
export type CustomerAsaasPresence = {
  state: "linked" | "both" | "unlinked";
  /** Asaas id to link to (same CPF there), when not linked yet. */
  linkTo: string | null;
};

export type CustomerAddress = {
  line: string | null;
  number: string | null;
  neighborhood: string | null;
  complement: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

export type EmergencyContact = {
  name: string | null;
  relation: string | null;
  phone: string | null;
  email: string | null;
};

export type CustomerDetail = CustomerListItem & {
  nationality: string | null;
  maritalStatus: string | null;
  profession: string | null;
  /** Calendar date (midnight UTC). */
  birthDate: string | null;
  rg: string | null;
  driverLicense: string | null;
  driverLicenseIssuedAt: string | null;
  driverLicenseValidUntil: string | null;
  address: CustomerAddress;
  emergencyContact: EmergencyContact;
  asaasCustomerId: string | null;
  excludeFromMetrics: boolean;
  updatedAt: string;
  rentals: RentalListItem[];
  documents: DocumentFile[];
};

export type CustomerFilters = {
  page: number;
  pageSize: number;
  q: string;
  /** API values: "" (= all) | "active" | "prospect". */
  status: "" | "active" | "prospect";
  /** "" = real customers only (API default) | "test" | "all". */
  test: "" | "test" | "all";
};
