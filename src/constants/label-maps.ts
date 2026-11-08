/**
 * Names of the label maps served by GET /labels (src/lib/labels.ts in the
 * API). The API is the single source of Portuguese labels — never copy them.
 */
export const LABEL_MAPS = {
  vehicleStatus: "VEHICLE_STATUS_LABELS",
  rentalStatus: "RENTAL_STATUS_LABELS",
  ratePeriod: "RATE_PERIOD_LABELS",
  paymentMethod: "PAYMENT_METHOD_LABELS",
  paymentStatus: "PAYMENT_STATUS_LABELS",
  paymentPurpose: "PAYMENT_PURPOSE_LABELS",
  leadStatus: "LEAD_STATUS_LABELS",
  reimbursementStatus: "REIMBURSEMENT_STATUS_LABELS",
  pixKeyType: "PIX_KEY_TYPE_LABELS",
  cautionType: "CAUTION_TYPE_LABELS",
  rentBillingTiming: "RENT_BILLING_TIMING_LABELS",
  weekday: "WEEKDAY_LABELS",
  customerStatus: "CUSTOMER_STATUS_LABELS",
  maintenanceType: "MAINTENANCE_TYPE_LABELS",
  maintenanceService: "MAINTENANCE_SERVICE_LABELS",
  inspectionType: "INSPECTION_TYPE_LABELS",
  inspectionActor: "INSPECTION_ACTOR_LABELS",
  statementSource: "STATEMENT_SOURCE_LABELS",
  transactionType: "TRANSACTION_TYPE_LABELS",
  debtKind: "DEBT_KIND_LABELS",
  debtInstallmentStatus: "DEBT_INSTALLMENT_STATUS_LABELS",
  debtInterestPeriod: "DEBT_INTEREST_PERIOD_LABELS",
  debtInterestMode: "DEBT_INTEREST_MODE_LABELS",
  debtInterestBase: "DEBT_INTEREST_BASE_LABELS",
  debtLenderType: "DEBT_LENDER_TYPE_LABELS",
  supplierScope: "SUPPLIER_SCOPE_LABELS",
  leadActivity: "LEAD_ACTIVITY_LABELS",
  proposalStatus: "PROPOSAL_STATUS_LABELS",
  userRole: "USER_ROLE_LABELS",
  signatureStatus: "SIGNATURE_REQUEST_STATUS_LABELS",
  signerStatus: "SIGNATURE_SIGNER_STATUS_LABELS",
  signerRole: "SIGNER_ROLE_LABELS",
  signerChannel: "SIGNER_CHANNEL_LABELS",
  documentOwner: "DOCUMENT_OWNER_LABELS",
  invoiceStatus: "INVOICE_STATUS_LABELS",
} as const;

export type LabelMapName = (typeof LABEL_MAPS)[keyof typeof LABEL_MAPS];
