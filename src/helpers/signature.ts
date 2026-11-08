import { routeTo } from "@/constants/routes";
import type {
  DocumentAttachment,
  DocumentFile,
  DocumentOwnerType,
} from "@/types/document";
import type {
  SignatureListItem,
  SignatureStatus,
  SignerRole,
} from "@/types/signature";
import { pluralize } from "@/utils/text";

/** Staff signs for the lessor; a customer's contact usually witnesses. */
export function candidateRole(candidate?: {
  kind: "customer" | "user" | "contact";
}): SignerRole {
  if (candidate?.kind === "user") return "LESSOR";
  if (candidate?.kind === "contact") return "WITNESS";
  return "LESSEE";
}

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
  SUPPLIER: "Custo fixo",
  COMPANY: "Empresa",
  LEAD: "Lead",
  LEAD_ACTIVITY: "Atividade de lead",
  PROPOSAL: "Proposta",
  REIMBURSEMENT: "Reembolso",
  PAYMENT: "Pagamento",
  DEBT: "Dívida da empresa",
  DEBT_PAYMENT: "Pagamento de dívida",
  CUSTOMER_DEBT: "Débito do cliente",
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

/**
 * Statuses where the request is still going (draft or sent): the API refuses
 * a second request for the same PDF (409), as the domain's live index does.
 */
const LIVE_SIGNATURE_STATUSES: SignatureStatus[] = ["DRAFT", "SENT"];

/** Only PDFs go to signature (the one format we issue for it). */
export function isPdfDocument(document: DocumentFile) {
  return (
    document.contentType === "application/pdf" ||
    document.fileName.toLowerCase().endsWith(".pdf")
  );
}

/** PDF without a live request: can be made signable. */
export function canMakeSignable(document: DocumentFile) {
  return (
    isPdfDocument(document) &&
    !(
      document.signature &&
      LIVE_SIGNATURE_STATUSES.includes(document.signature.status)
    )
  );
}

/**
 * Any request (even finished) locks deleting the PDF and replacing its file:
 * deleting would take the request — and who signed — with it.
 */
export function isUnderSignature(document: Pick<DocumentFile, "signature">) {
  return Boolean(document.signature);
}

/** The signature request's name suggested from the file ("contrato.pdf"). */
export function signatureNameFrom(fileName: string) {
  return fileName.replace(/\.pdf$/i, "");
}

/** "2 de 3 assinaram" / "1 signatário" (draft: nobody was asked yet). */
export function signersProgress(signature: SignatureListItem) {
  if (signature.signerCount === 0) return "Sem signatários";
  if (signature.status === "DRAFT") {
    return pluralize(signature.signerCount, "signatário", "signatários");
  }
  return `${signature.signedCount} de ${signature.signerCount} assinaram`;
}

/** Receipts hung on a charge come without type/size: only full files sign. */
export function isDocumentFile(
  document: DocumentAttachment,
): document is DocumentFile {
  return "contentType" in document;
}
