export type UserRole = "ADMIN" | "AGENT" | "CUSTOMER";

/** Who owns the token: staff (`user`) or a renter (`customer`). */
export type AuthKind = "user" | "customer";

/** The two areas of the app, each with its own login. */
export type Realm = "gestao" | "cliente";

export type AuthUser = {
  kind: AuthKind;
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type CustomerLoginInput = {
  /** E-mail or CPF. */
  identifier: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type MeResponse = {
  user: AuthUser;
};
