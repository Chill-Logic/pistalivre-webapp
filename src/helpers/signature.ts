import { routeTo } from "@/constants/routes";
import type { DocumentOwnerType } from "@/types/document";
import type { SignatureListItem } from "@/types/signature";
import { pluralize } from "@/utils/text";

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
