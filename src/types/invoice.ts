/** NFS-e (read-through of Asaas: nothing of ours is stored). */
export type Invoice = {
  id: string;
  /** SCHEDULED, AUTHORIZED, CANCELED, ERROR… (INVOICE_STATUS_LABELS). */
  status: string;
  number: string | null;
  value: number;
  serviceDescription: string;
  /** Calendar date. */
  effectiveDate: string | null;
  pdfUrl: string | null;
  /** null = loose (can be linked to a rental). */
  rentalId: string | null;
};

/** What the rental's "Emitir NF" pre-fills (same as the management app). */
export type InvoiceSuggestions = {
  rentMonths: {
    /** YYYY-MM */
    key: string;
    label: string;
    sum: number;
    serviceDescription: string;
  }[];
  caution: { sum: number; serviceDescription: string };
};

/** GET /rentals/:id/invoices. `error` = Asaas is down (suggestions still come). */
export type RentalInvoices = {
  items: Invoice[];
  suggestions: InvoiceSuggestions;
  error: string | null;
};

export type CustomerInvoices = { items: Invoice[]; error: string | null };

export type RentalInvoiceInput = {
  value: number;
  serviceDescription: string;
  effectiveDate?: string;
};

export type StandaloneInvoiceInput = {
  customerId: string;
  rentalId?: string;
  value: number;
  description: string;
};
