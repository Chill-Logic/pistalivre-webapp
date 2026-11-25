import type { PwaUsageFields } from "@/helpers/pwa";
import type { DocumentFile } from "@/types/document";

export type UserRole = "ADMIN" | "AGENT";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLoginAt: string | null;
  createdAt: string;
} & PwaUsageFields;

export type StaffUserDetail = StaffUser & {
  /** Digits only. */
  cpf: string | null;
  /** Digits only (area code + number). */
  phone: string | null;
  /**
   * Other numbers of the same person (the company mobile they use), digits
   * only: the WhatsApp bot answers them as this user.
   */
  extraPhones: string[];
  /** Calendar date. */
  birthDate: string | null;
  updatedAt: string;
  /** The user's papers (ID, proof of address, work contract…). */
  documents: DocumentFile[];
};

export type UserFilters = {
  page: number;
  pageSize: number;
  q: string;
  role: UserRole | "";
};

/** Body of POST/PUT /users (the password only on create). */
export type UserInput = {
  name: string;
  email: string;
  /** Digits only. */
  cpf: string;
  /** Digits only; null = none. */
  phone: string | null;
  /** Digits only. Only an admin's value is stored; left out = kept as is. */
  extraPhones?: string[];
  /** yyyy-mm-dd or null. */
  birthDate: string | null;
  /** Ignored by the API when an agent edits themselves. */
  role: UserRole;
  password?: string;
};

export type UserPasswordInput = {
  /** Own password: the current one. Admin on someone else: the admin's. */
  currentPassword: string;
  newPassword: string;
};
