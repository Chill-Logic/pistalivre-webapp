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
