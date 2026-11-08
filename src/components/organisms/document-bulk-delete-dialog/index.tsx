import type { QueryKey } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { useBulkDocumentDelete } from "@/hooks/api/gestao/documents/useBulkDocumentDelete";
import type { DocumentFile } from "@/types/document";
import { pluralize } from "@/utils/text";

type DocumentBulkDeleteDialogProps = {
  /** The selected documents (only deletable ones get selected). */
  documents: DocumentFile[];
  invalidate: QueryKey;
  /** After the run: the ids that were deleted (to clear the selection). */
  onDeleted: (ids: string[]) => void;
};

/**
 * "Excluir selecionados": confirms, deletes one by one with progress and,
 * when some fail, keeps the dialog open listing which and why.
 */
export function DocumentBulkDeleteDialog({
  documents,
  invalidate,
  onDeleted,
}: DocumentBulkDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const bulk = useBulkDocumentDelete(invalidate);
  const count = documents.length;

  const onOpenChange = (next: boolean) => {
    if (bulk.isPending) return;
    setOpen(next);
    if (!next) bulk.reset();
  };

  const confirm = async () => {
    const { failed } = await bulk.run(documents);
    const failedIds = new Set(failed.map((failure) => failure.document.id));
    onDeleted(
      documents
        .filter((document) => !failedIds.has(document.id))
        .map((document) => document.id),
    );
    if (failed.length === 0) setOpen(false);
  };

  const showFailures = bulk.failures.length > 0 && !bulk.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 />
          Excluir selecionados
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>
          {showFailures
            ? "Alguns documentos não foram excluídos"
            : `Excluir ${pluralize(count, "documento", "documentos")}?`}
        </DialogTitle>
        <DialogDescription>
          {showFailures
            ? "Os demais foram apagados. Veja o motivo de cada um abaixo."
            : "Os arquivos são apagados de vez. Esta ação não pode ser desfeita."}
        </DialogDescription>
        {bulk.progress && (
          <Text size="xs" tone="muted" aria-live="polite">
            Excluindo {bulk.progress.done + 1} de {bulk.progress.total}…
          </Text>
        )}
        {showFailures && (
          <Alert>
            <List className="space-y-1">
              {bulk.failures.map((failure) => (
                <ListItem key={failure.document.id}>
                  <Text size="sm" weight="medium" className="break-words">
                    {failure.document.fileName}
                  </Text>
                  <Text size="xs">{failure.message}</Text>
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
        <DialogFooter>
          {showFailures ? (
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          ) : (
            <>
              <DialogClose asChild>
                <Button variant="outline" disabled={bulk.isPending}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={confirm}
                disabled={bulk.isPending || count === 0}
              >
                {bulk.isPending && (
                  <Spinner className="text-primary-foreground" />
                )}
                Excluir {pluralize(count, "documento", "documentos")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
