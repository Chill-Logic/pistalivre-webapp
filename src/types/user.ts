export type UserRole = "ADMIN" | "AGENT";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLoginAt: string | null;
  createdAt: string;
};

export type StaffUserDetail = StaffUser & {
  /** Digits only. */
  cpf: string | null;
  /** Calendar date. */
  birthDate: string | null;
  updatedAt: string;
};

export type UserFilters = { q: string; role: UserRole | "" };
