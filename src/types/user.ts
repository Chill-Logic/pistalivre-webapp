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
