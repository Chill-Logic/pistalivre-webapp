import { CONTRACT_CATEGORY_SLUG } from "@/constants/contract";
import { queryKeys } from "@/constants/query-keys";
import type { Contract } from "@/types/contract";
import type { DocumentFile } from "@/types/document";

/**
 * Cache keys of a rental's contracts and of the merged draft. They live under
 * `rentals.all`, so the invalidations that already exist reach them.
 */
export function rentalContractsKey(rentalId: string) {
  return [...queryKeys.rentals.all, "contracts", rentalId] as const;
}

export function contractDraftKey(rentalId?: string, templateId?: string) {
  return [
    ...queryKeys.rentals.all,
    "contract-draft",
    ...(rentalId ? [rentalId] : []),
    ...(templateId ? [templateId] : []),
  ] as const;
}

/** Server config (AI on/off): changes only with a deploy. */
export const CONTRACT_OPTIONS_KEY = ["contracts", "options"] as const;

/** "Contrato", "Contrato assinado"… (slug `contrato` or `contrato-*`). */
export function isContractCategory(slug: string | undefined) {
  return (
    slug === CONTRACT_CATEGORY_SLUG ||
    (slug?.startsWith(`${CONTRACT_CATEGORY_SLUG}-`) ?? false)
  );
}

/**
 * A rental's documents split as in the management app: generated contract
 * PDFs and "Contrato…" kinds go to the "Contratos" card; the rest stays in
 * "Documentos". `contractDocuments` are only the ones NOT generated here
 * (e.g. the signed PDF of a retroactive rental).
 */
export function splitRentalDocuments(
  documents: DocumentFile[],
  contracts: Contract[],
) {
  const generated = new Set(
    contracts
      .map((contract) => contract.document?.id)
      .filter((id): id is string => Boolean(id)),
  );
  const contractDocuments: DocumentFile[] = [];
  const otherDocuments: DocumentFile[] = [];
  for (const document of documents) {
    if (generated.has(document.id)) continue;
    if (isContractCategory(document.category?.slug)) {
      contractDocuments.push(document);
    } else {
      otherDocuments.push(document);
    }
  }
  return { contractDocuments, otherDocuments };
}
