import type { QueryKey } from "@tanstack/react-query";
import { Lock, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { DocumentItem } from "@/components/molecules/document-item";
import { DocumentBulkDeleteDialog } from "@/components/organisms/document-bulk-delete-dialog";
import { DocumentEditDialog } from "@/components/organisms/document-edit-dialog";
import { DocumentSignableDialog } from "@/components/organisms/document-signable-dialog";
import {
  canMakeSignable,
  isDocumentFile,
  isUnderSignature,
} from "@/helpers/signature";
import { useDocumentMutations } from "@/hooks/api/gestao/documents/useDocumentMutations";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type {
  DocumentAttachment,
  DocumentFile,
  DocumentOwner,
} from "@/types/document";

type ManagedDocumentListProps = {
  documents: DocumentFile[];
  /** Whose documents (kinds come from its type). */
  owner: DocumentOwner;
  /** The query that lists them (refreshed after each change). */
  invalidate: QueryKey;
};

/**
 * Documents the staff manages: pick several to delete at once, and on each
 * one view/download, make signable (PDF), edit and delete. A document under
 * signature can't be picked nor deleted (the lock says why).
 */
export function ManagedDocumentList({
  documents,
  owner,
  invalidate,
}: ManagedDocumentListProps) {
  const { view, download } = useFileActions();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Only deletable documents can be picked (also by "select all"); a
  // selection left over from a refetch (document gone) is ignored.
  const deletable = useMemo(
    () => documents.filter((document) => !isUnderSignature(document)),
    [documents],
  );
  const picked = deletable.filter((document) => selected.has(document.id));
  const allPicked = deletable.length > 0 && picked.length === deletable.length;

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <Box>
      {deletable.length > 1 && (
        <Box className="flex min-h-11 items-center gap-3 border-b pb-2">
          <Checkbox
            checked={
              allPicked ? true : picked.length > 0 ? "indeterminate" : false
            }
            onCheckedChange={() =>
              setSelected(
                allPicked
                  ? new Set()
                  : new Set(deletable.map((document) => document.id)),
              )
            }
            aria-label="Selecionar todos"
          />
          <Text size="xs" tone="muted" className="flex-1">
            {picked.length > 0
              ? `${picked.length} selecionado${picked.length > 1 ? "s" : ""}`
              : "Selecionar"}
          </Text>
          {picked.length > 0 && (
            <DocumentBulkDeleteDialog
              documents={picked}
              invalidate={invalidate}
              onDeleted={(ids) =>
                setSelected((current) => {
                  const next = new Set(current);
                  ids.forEach((id) => next.delete(id));
                  return next;
                })
              }
            />
          )}
        </Box>
      )}
      <Box className="divide-y">
        {documents.map((document) => (
          <DocumentItem
            key={document.id}
            document={document}
            onView={() => view.mutate(document)}
            onDownload={() => download.mutate(document)}
            isViewing={view.isPending && view.variables?.id === document.id}
            isDownloading={
              download.isPending && download.variables?.id === document.id
            }
            selection={
              deletable.length > 1
                ? {
                    checked: selected.has(document.id),
                    onCheckedChange: (checked) => toggle(document.id, checked),
                    disabled: isUnderSignature(document),
                  }
                : undefined
            }
            actions={
              <ManageDocumentActions
                document={document}
                owner={owner}
                invalidate={invalidate}
              />
            }
          />
        ))}
      </Box>
    </Box>
  );
}

/** Make signable (PDF), edit and delete (or the lock) of one document. */
export function ManageDocumentActions({
  document,
  owner,
  invalidate,
}: {
  document: DocumentAttachment;
  owner: DocumentOwner;
  invalidate: QueryKey;
}) {
  const { remove } = useDocumentMutations(owner, invalidate);
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      {isDocumentFile(document) && canMakeSignable(document) && (
        <DocumentSignableDialog document={document} invalidate={invalidate} />
      )}
      <DocumentEditDialog
        document={document}
        owner={owner}
        invalidate={invalidate}
      />
      {isUnderSignature(document) ? (
        // Deleting would take the signature request (and who signed) along.
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-label={`Não é possível excluir ${document.fileName}: documento em assinatura`}
          title="Documento em assinatura: exclua o pedido antes de excluir o arquivo."
        >
          <Lock />
        </Button>
      ) : (
        <ConfirmDialog
          destructive
          open={confirming}
          onOpenChange={setConfirming}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label={`Excluir ${document.fileName}`}
            >
              <Trash2 />
            </Button>
          }
          title="Excluir documento?"
          description={`"${document.fileName}" é apagado de vez.`}
          confirmLabel="Excluir documento"
          isPending={remove.isPending}
          onConfirm={() =>
            remove.mutate(document.id, {
              onSuccess: () => setConfirming(false),
            })
          }
        />
      )}
    </>
  );
}
