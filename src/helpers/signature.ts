import { routeTo } from "@/constants/routes";
import type { DocumentOwnerType } from "@/types/document";
import type { SignatureListItem } from "@/types/signature";
import { pluralize } from "@/utils/text";

/**
 * "Documento de: Veículo". The API catalog (`DOCUMENT_OWNER_LABELS`) names
 * the document FOLDERS, in the plural, so the singular lives here.
 */
const OWNER_NAME: Record<string, string> = {
  VEHICLE: "Veículo",
  CUSTOMER: "Cliente",
  RENTAL: "Locação",
  INSPECTION: "Vistoria",
  MAINTENANCE: "Manutenção",
  SUPPLIER: "Fornecedor",
  COMPANY: "Empresa",
  LEAD: "Lead",
  LEAD_ACTIVITY: "Atividade de lead",
  PROPOSAL: "Proposta",
  REIMBURSEMENT: "Reembolso",
  PAYMENT: "Pagamento",
  DEBT: "Dívida da empresa",
  DEBT_PAYMENT: "Pagamento de dívida",
};

/** Singular name of the record type a signed document belongs to. */
export function documentOwnerName(type: string) {
  return OWNER_NAME[type] ?? type;
}

/** Screen of the record the signed document belongs to, when there is one. */
export function documentOwnerHref(type: DocumentOwnerType, id: string) {
  switch (type) {
    case "VEHICLE":
      return routeTo.vehicle(id);
    case "CUSTOMER":
      return routeTo.customer(id);
    case "RENTAL":
      return routeTo.rental(id);
    case "SUPPLIER":
      return routeTo.supplier(id);
    case "MAINTENANCE":
      return routeTo.maintenance(id);
    case "DEBT":
      return routeTo.debt(id);
    default:
      return null;
  }
}

/** "2 de 3 assinaram" / "1 signatário" (draft: nobody was asked yet). */
export function signersProgress(signature: SignatureListItem) {
  if (signature.signerCount === 0) return "Sem signatários";
  if (signature.status === "DRAFT") {
    return pluralize(signature.signerCount, "signatário", "signatários");
  }
  return `${signature.signedCount} de ${signature.signerCount} assinaram`;
}
