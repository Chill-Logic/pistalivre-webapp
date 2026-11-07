/** Body of POST/PUT /customers (same fields as the management form). */
export type CustomerInput = {
  /** Converting a lead: links it to the new customer (WON). */
  leadId?: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  nationality: string | null;
  maritalStatus: string | null;
  profession: string | null;
  /** yyyy-mm-dd */
  birthDate: string | null;
  rg: string | null;
  emergencyContactName: string | null;
  emergencyContactRelation: string | null;
  emergencyContactPhone: string | null;
  emergencyContactEmail: string | null;
  addressLine: string | null;
  addressNumber: string | null;
  neighborhood: string | null;
  complement: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

/** Asaas upsert is best-effort: it never undoes the local save. */
export type AsaasSync = { synced: true } | { synced: false; error: string };

export type CustomerSaveResult = {
  customer: import("@/types/customer").CustomerDetail;
  asaas: AsaasSync;
};
