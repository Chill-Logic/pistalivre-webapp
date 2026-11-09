export type UserRole = "ADMIN" | "AGENT" | "CUSTOMER" | "PARTNER";

/**
 * Who owns the token: staff (`user`), a renter (`customer`) or a partner
 * (`partner`: investor or owner of motorcycles the company manages).
 */
export type AuthKind = "user" | "customer" | "partner";

/** The three areas of the app, each with its own login. */
export type Realm = "gestao" | "cliente" | "parceiro";

/** Installed-app (PWA) usage of the logged-in person, ISO dates. */
export type PwaUsage = {
  /** First request made from the installed app (null = never opened it). */
  firstUsedAt: string | null;
  lastUsedAt: string | null;
  /** Clicked "Instalar" on the invite (may not have opened the app yet). */
  installedAt: string | null;
  /** Last "Agora não" on the invite. */
  inviteDismissedAt: string | null;
};

export type AuthUser = {
  kind: AuthKind;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /**
   * Absent on an older API or on the login answer; null for a partner (the
   * partner area has no install invite): the invite stays hidden.
   */
  pwa?: PwaUsage | null;
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
