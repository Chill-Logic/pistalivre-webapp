import { queryKeys } from "@/constants/query-keys";

/** Burst window: a sync from Asaas fires dozens of events in a row. */
export const REALTIME_FLUSH_MS = 400;

/**
 * Server event → caches it makes stale. Staff receive every event; a customer
 * only the ones carrying their `customerId` (the portal caches live under
 * `portal`). Invalidation only refetches what is on screen.
 */
export const REALTIME_INVALIDATIONS: Record<
  string,
  readonly (readonly string[])[]
> = {
  "payment.created": [
    queryKeys.rentals.all,
    queryKeys.customers.all,
    queryKeys.finance.all,
    queryKeys.dashboard.all,
    queryKeys.portal.all,
  ],
  "payment.updated": [
    queryKeys.rentals.all,
    queryKeys.customers.all,
    queryKeys.finance.all,
    queryKeys.dashboard.all,
    queryKeys.portal.all,
  ],
  "payment.deleted": [
    queryKeys.rentals.all,
    queryKeys.customers.all,
    queryKeys.finance.all,
    queryKeys.dashboard.all,
    queryKeys.portal.all,
  ],
  /** Someone (another tab, the chat, an MCP client) changed a contract under review. */
  "contract_draft.updated": [queryKeys.contractDrafts.all],
  "invoice.updated": [
    queryKeys.rentals.all,
    queryKeys.customers.all,
    queryKeys.finance.all,
    queryKeys.portal.all,
  ],
  "reimbursement.created": [
    queryKeys.reimbursements.all,
    queryKeys.rentals.all,
    queryKeys.finance.all,
    queryKeys.portal.all,
  ],
  "reimbursement.updated": [
    queryKeys.reimbursements.all,
    queryKeys.rentals.all,
    queryKeys.finance.all,
    queryKeys.portal.all,
  ],
  "signature.updated": [
    queryKeys.signatures.all,
    queryKeys.documents.all,
    queryKeys.rentals.all,
    queryKeys.customers.all,
  ],
  "document.signed": [
    queryKeys.signatures.all,
    queryKeys.documents.all,
    queryKeys.rentals.all,
    queryKeys.customers.all,
    queryKeys.portal.all,
  ],
  "vehicle.created": [queryKeys.vehicles.all, queryKeys.dashboard.all],
  "vehicle.status_changed": [
    queryKeys.vehicles.all,
    queryKeys.rentals.all,
    queryKeys.dashboard.all,
  ],
  "rental.created": [
    queryKeys.rentals.all,
    queryKeys.vehicles.all,
    queryKeys.customers.all,
    queryKeys.dashboard.all,
  ],
  "rental.status_changed": [
    queryKeys.rentals.all,
    queryKeys.vehicles.all,
    queryKeys.customers.all,
    queryKeys.dashboard.all,
    queryKeys.portal.all,
  ],
  "customer.created": [queryKeys.customers.all, queryKeys.dashboard.all],
  "transfer.updated": [queryKeys.finance.all, queryKeys.reimbursements.all],
  "bank.updated": [queryKeys.finance.all],
  /** The assistant (chat/MCP) changed a partner contract's terms, calculator or vehicles. */
  "partner_contract.updated": [queryKeys.partners.all],
};
