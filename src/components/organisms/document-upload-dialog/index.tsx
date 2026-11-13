import type { QueryKey } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Box } from "@/components/atoms/box";
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
import { FileInput } from "@/components/atoms/file-input";
import { AttachDropZone } from "@/components/molecules/attach-drop-zone";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import {
  UploadFileRow,
  type UploadRowState,
} from "@/components/molecules/upload-file-row";
import { errorMessage } from "@/helpers/api-error";
import { useDocumentCategories } from "@/hooks/api/gestao/documents/useDocumentCategories";
import { useDocumentMutations } from "@/hooks/api/gestao/documents/useDocumentMutations";
import type { DocumentOwner } from "@/types/document";

const ACCEPT = "application/pdf,image/*,.doc,.docx,.xls,.xlsx,.odt,.ods";

type Row = {
  key: string;
  file: File;
  categoryId: string;
  state: UploadRowState;
  error?: string;
};

type DocumentUploadDialogProps = {
  owner: DocumentOwner;
  /** The query that lists the owner's documents (refreshed after). */
  invalidate: QueryKey;
  /** Text of the opening button. */
  triggerLabel?: string;
};

/**
 * Pick several files, give each its kind, send them one per request (as
 * the API wants). The ones that fail stay listed with the reason, so they
 * can be fixed and sent again; the sent ones leave.
 */
export function DocumentUploadDialog({
  owner,
  invalidate,
  triggerLabel = "Enviar",
}: DocumentUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addFiles = (picked: File[]) =>
    setRows((current) => [
      ...current,
      ...picked.map((file, index) => ({
        key: `${Date.now()}-${index}-${file.name}`,
        file,
        categoryId: "",
        state: "idle" as const,
      })),
    ]);
  // Fetched with the card (cached), so the kind pickers are there as soon
  // as files are chosen.
  const categories = useDocumentCategories(owner.type);
  const { upload } = useDocumentMutations(owner, invalidate);

  const patch = (key: string, next: Partial<Row>) =>
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...next } : row)),
    );

  const onOpenChange = (next: boolean) => {
    if (sending) return;
    setOpen(next);
    if (next) setRows([]);
  };

  const send = async () => {
    setSending(true);
    const pending = rows.filter((row) => row.state !== "sent");
    let failures = 0;
    for (const row of pending) {
      patch(row.key, { state: "sending", error: undefined });
      try {
        await upload.mutateAsync({
          file: row.file,
          categoryId: row.categoryId || undefined,
        });
        patch(row.key, { state: "sent" });
      } catch (error) {
        failures += 1;
        patch(row.key, { state: "failed", error: errorMessage(error) });
      }
    }
    setSending(false);
    if (failures === 0) {
      setOpen(false);
    } else {
      setRows((current) => current.filter((row) => row.state !== "sent"));
    }
  };

  const sentCount = rows.filter((row) => row.state === "sent").length;
  const toSend = rows.filter((row) => row.state !== "sent").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Enviar documentos</DialogTitle>
        <DialogDescription>
          PDF, imagens ou documentos do Office, até 15 MB cada.
        </DialogDescription>
        <FileInput
          ref={inputRef}
          multiple
          accept={ACCEPT}
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
        <Box className="max-h-[50dvh] space-y-2 overflow-y-auto">
          {rows.map((row) => (
            <UploadFileRow
              key={row.key}
              file={row.file}
              categories={categories.data ?? []}
              categoryId={row.categoryId}
              onCategoryChange={(categoryId) => patch(row.key, { categoryId })}
              onRemove={() =>
                setRows((current) => current.filter((r) => r.key !== row.key))
              }
              state={row.state}
              error={row.error}
              disabled={sending}
            />
          ))}
        </Box>
        <AttachDropZone onFiles={addFiles} disabled={sending}>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={sending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload />
            {rows.length ? "Adicionar mais arquivos" : "Escolher arquivos"}
          </Button>
        </AttachDropZone>
        {sending && (
          <Text size="xs" tone="muted" aria-live="polite">
            Enviando {sentCount + 1} de {sentCount + toSend}…
          </Text>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={sending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={sending || toSend === 0}
            onClick={send}
          >
            {sending && <Spinner className="text-primary-foreground" />}
            {toSend > 1 ? `Enviar ${toSend} arquivos` : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
