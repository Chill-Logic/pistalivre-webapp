import type { DocumentFile } from "@/types/document";

export type CompanyIntegration = {
  provider: string;
  label: string;
  /** Credentials saved (they never leave the server). */
  configured: boolean;
  active: boolean;
};

export type Company = {
  id: string;
  slug: string;
  /** CNPJ, normalized (14 chars; may be alphanumeric). */
  document: string;
  legalName: string;
  tradeName: string | null;
  representative: string | null;
  email: string | null;
  phone: string | null;
  /** Digits with country code. */
  whatsapp: string | null;
  address: {
    line: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  createdAt: string;
  updatedAt: string;
  documents: DocumentFile[];
  integrations: CompanyIntegration[];
};

/** PUT /company — replaces the registration data. */
export type CompanyInput = {
  document: string;
  legalName: string;
  tradeName: string;
  representative: string | null;
  email: string | null;
  phone: string | null;
  /** Digits; the API adds the country code (55) to a 10/11-digit number. */
  whatsapp: string | null;
  address: Company["address"];
};

/** One input of a provider's form (the API's catalog drives the form). */
export type IntegrationField = {
  key: string;
  label: string;
  /** Never comes back: `value` is always "" and only `isSet` tells. */
  secret: boolean;
  required: boolean;
  placeholder?: string | null;
  multiline?: boolean | null;
  /** Checkbox group; the value is the checked options. */
  options?: { value: string; label: string }[] | null;
  /** File read as text in the browser (e.g. a PEM). */
  file?: boolean | null;
  accept?: string | null;
  help?: string | null;
  value: string;
  isSet: boolean;
};

export type IntegrationConfig = {
  provider: string;
  label: string;
  hint?: string | null;
  configured: boolean;
  active: boolean;
  fields: IntegrationField[];
};

/** Form state of one provider: text per field, list for checkbox groups. */
export type IntegrationValues = Record<string, string | string[]>;

/** PUT /company/integrations/:provider — a blank secret keeps the stored one. */
export type IntegrationInput = {
  values: IntegrationValues;
  active: boolean;
};

export type IntegrationTestResult = { ok: boolean; message: string };

export type InterWebhookRegistration = {
  transferUrl: string;
  pixInUrl: string | null;
};
