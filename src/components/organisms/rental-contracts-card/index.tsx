import { FilePlus2, FileText, Signature, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { DocumentItem } from "@/components/molecules/document-item";
import { DocumentEditDialog } from "@/components/organisms/document-edit-dialog";
import { ManageDocumentActions } from "@/components/organisms/documents-card";
import { QueryError } from "@/components/organisms/query-error";
import { CONTRACT_STATUS_LABELS } from "@/constants/contract";
import { LABEL_MAPS } from "@/constants/label-maps";
import { queryKeys } from "@/constants/query-keys";
import { routeTo } from "@/constants/routes";
import { splitRentalDocuments } from "@/helpers/contract";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import { useDeleteContract } from "@/hooks/api/gestao/contracts/useContractMutations";
import { useRentalContracts } from "@/hooks/api/gestao/contracts/useRentalContracts";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Contract } from "@/types/contract";
import type { DocumentFile, DocumentOwner } from "@/types/document";
import type { RentalDetail } from "@/types/rental";
import { formatDate } from "@/utils/format";

/**
 * Renames touch the rental's documents and its contracts list: both live
 * under `rentals.all`.
 */
const INVALIDATE = queryKeys.rentals.all;

/**
 * "Contratos" of a rental, as in the management app: the generated contracts
 * (status, PDF, rename, delete) + the documents of a "Contrato…" kind (e.g.
 * the signed PDF of a retroactive rental), which leave the generic card. A
 * PDF in a signature request keeps a link to it and cannot be deleted here.
 * "Gerar contrato" does not exist on a retroactive rental (MANUAL).
 */
export function RentalContractsCard({ rental }: { rental: RentalDetail }) {
  const contracts = useRentalContracts(rental.id);
  const retroactive = rental.source === "MANUAL";
  const owner: DocumentOwner = { type: "RENTAL", id: rental.id };
  // The rental's documents carry the signature request (the contracts list does not).
  const byId = new Map(rental.documents.map((doc) => [doc.id, doc]));
  const { contractDocuments } = splitRentalDocuments(
    rental.documents,
    contracts.data ?? [],
  );
  const total = (contracts.data?.length ?? 0) + contractDocuments.length;

  return (
    <CollapsibleCard
      title="Contratos"
      count={contracts.data ? total : undefined}
      storageKey="rental-contracts"
      actions={
        !retroactive && (
          <Button asChild size="sm">
            <Link to={routeTo.newRentalContract(rental.id)}>
              <FilePlus2 />
              Gerar contrato
            </Link>
          </Button>
        )
      }
    >
      {contracts.isPending ? (
        <ContractRowsSkeleton />
      ) : contracts.isError ? (
        <QueryError
          error={contracts.error}
          onRetry={() => contracts.refetch()}
        />
      ) : total === 0 ? (
        <Text tone="muted">
          {retroactive
            ? "Locação retroativa: anexe o contrato assinado em Documentos, com o tipo “Contrato assinado”."
            : "Nenhum contrato gerado ainda."}
        </Text>
      ) : (
        <Box className="divide-y">
          {contracts.data.map((contract) => (
            <ContractRow
              key={contract.id}
              contract={contract}
              document={
                contract.document
                  ? (byId.get(contract.document.id) ?? contract.document)
                  : null
              }
              owner={owner}
            />
          ))}
          {contractDocuments.map((document) => (
            <ContractDocumentRow
              key={document.id}
              document={document}
              owner={owner}
            />
          ))}
        </Box>
      )}
    </CollapsibleCard>
  );
}

/** Opens the signature request that holds this PDF (followed in Assinaturas). */
function SignatureLink({ document }: { document: DocumentFile }) {
  if (!document.signature) return null;
  return (
    <Button asChild variant="ghost" size="icon">
      <Link
        to={routeTo.signature(document.signature.requestId)}
        aria-label={`Ver a assinatura de ${document.fileName}`}
      >
        <Signature />
      </Link>
    </Button>
  );
}

function ContractRow({
  contract,
  document,
  owner,
}: {
  contract: Contract;
  document: DocumentFile | null;
  owner: DocumentOwner;
}) {
  const { view, download } = useFileActions();
  const { label } = useLabels();
  const signature = document?.signature;
  const subtitle = [
    CONTRACT_STATUS_LABELS[contract.status] ?? contract.status,
    formatDate(contract.createdAt),
    signature &&
      `Em assinatura: ${label(LABEL_MAPS.signatureStatus, signature.status)}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const remove = signature ? null : (
    <DeleteContractButton contract={contract} name={document?.fileName} />
  );

  if (!document) {
    return (
      <Box className="flex items-center gap-3 py-3">
        <FileText
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <Box className="min-w-0 flex-1">
          <Text weight="medium" truncate>
            Contrato
          </Text>
          <Text size="xs" tone="muted" truncate>
            {subtitle} · sem PDF
          </Text>
        </Box>
        {remove}
      </Box>
    );
  }

  return (
    <DocumentItem
      document={document}
      subtitle={subtitle}
      onView={() => view.mutate(document)}
      onDownload={() => download.mutate(document)}
      isViewing={view.isPending}
      isDownloading={download.isPending}
      actions={
        <>
          <SignatureLink document={document} />
          <DocumentEditDialog
            document={document}
            owner={owner}
            invalidate={INVALIDATE}
          />
          {remove}
        </>
      }
    />
  );
}

function ContractDocumentRow({
  document,
  owner,
}: {
  document: DocumentFile;
  owner: DocumentOwner;
}) {
  const { view, download } = useFileActions();
  const { label } = useLabels();
  const signature = document.signature;

  return (
    <DocumentItem
      document={document}
      subtitle={
        signature
          ? [
              document.category?.name,
              formatDate(document.createdAt),
              `Em assinatura: ${label(LABEL_MAPS.signatureStatus, signature.status)}`,
            ]
              .filter(Boolean)
              .join(" · ")
          : undefined
      }
      onView={() => view.mutate(document)}
      onDownload={() => download.mutate(document)}
      isViewing={view.isPending}
      isDownloading={download.isPending}
      actions={
        signature ? (
          <>
            <SignatureLink document={document} />
            <DocumentEditDialog
              document={document}
              owner={owner}
              invalidate={INVALIDATE}
            />
          </>
        ) : (
          <ManageDocumentActions
            document={document}
            owner={owner}
            invalidate={INVALIDATE}
          />
        )
      }
    />
  );
}

function DeleteContractButton({
  contract,
  name,
}: {
  contract: Contract;
  name?: string;
}) {
  const remove = useDeleteContract(contract.rentalId);
  const [open, setOpen] = useState(false);

  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          aria-label={`Excluir ${name ?? "contrato"}`}
        >
          <Trash2 />
        </Button>
      }
      title="Excluir contrato?"
      description="O contrato e o PDF dele são apagados de vez. Contrato que está num pedido de assinatura não pode ser excluído: exclua o pedido em Assinaturas antes."
      confirmLabel="Excluir contrato"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(contract.id, { onSettled: () => setOpen(false) })
      }
    />
  );
}

const CONTRACT_ROWS = 2;

function ContractRowsSkeleton() {
  return (
    <Box className="divide-y">
      {Array.from({ length: CONTRACT_ROWS }, (_, index) => (
        <Box key={index} className="flex items-center gap-3 py-3">
          <Skeleton className="size-5 shrink-0" />
          <Box className="min-w-0 flex-1 space-y-2">
            <Skeleton shape="text" className="w-1/2 text-sm" />
            <Skeleton shape="text" className="w-1/3 text-xs" />
          </Box>
          <Skeleton className="size-9 shrink-0" />
          <Skeleton className="size-9 shrink-0" />
        </Box>
      ))}
    </Box>
  );
}

export function RentalContractsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <Skeleton shape="text" className="w-24 text-base" />
        <Skeleton className="h-8 w-36" />
      </CardHeader>
      <CardContent>
        <ContractRowsSkeleton />
      </CardContent>
    </Card>
  );
}
