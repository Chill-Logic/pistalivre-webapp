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
  lastLoginAt: string | null;
  createdAt: string;
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
