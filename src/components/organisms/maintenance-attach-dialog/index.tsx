import { Paperclip, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Alert } from "@/components/atoms/alert";
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
import { useAttachMaintenanceDocument } from "@/hooks/api/cliente/rentals/useAttachMaintenanceDocument";
import { useMyDocumentCategories } from "@/hooks/api/cliente/rentals/useMyDocumentCategories";
import type { DocumentCategory } from "@/types/document";

const ACCEPT = "application/pdf,image/*,.doc,.docx,.xls,.xlsx,.odt,.ods";
/** The kind most files here are (what a refused refund usually misses). */
const DEFAULT_CATEGORY_SLUG = "recibo";

type Row = {
  key: string;
  file: File;
  categoryId: string;
  state: UploadRowState;
  error?: string;
};

function defaultCategoryId(categories: DocumentCategory[] | undefined) {
  if (!categories?.length) return "";
  return (
    categories.find((category) => category.slug === DEFAULT_CATEGORY_SLUG)
      ?.id ?? categories[0].id
  );
}

/**
 * More files on a maintenance the renter registered (the receipt a refused
 * refund missed, the invoice, a photo). Each file gets its kind and goes in
 * its own request; the failed ones stay listed with the reason.
 */
export function MaintenanceAttachDialog({
  rentalId,
  maintenanceId,
}: {
  rentalId: string;
  maintenanceId: string;
}) {
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
        categoryId: fallbackCategory,
        state: "idle" as const,
      })),
    ]);
  const categories = useMyDocumentCategories("MAINTENANCE", open);
  const attach = useAttachMaintenanceDocument(rentalId, maintenanceId);
  const fallbackCategory = defaultCategoryId(categories.data);

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
      const categoryId = row.categoryId || fallbackCategory;
      if (!categoryId) {
        failures += 1;
        patch(row.key, { state: "failed", error: "Escolha o tipo" });
        continue;
      }
      patch(row.key, { state: "sending", error: undefined, categoryId });
      try {
        await attach.mutateAsync({ file: row.file, categoryId });
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
          <Paperclip />
          Anexar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Anexar à manutenção</DialogTitle>
        <DialogDescription>
          Recibo, nota, orçamento ou foto do serviço. PDF, imagens ou documentos
          do Office, até 15 MB cada.
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
              categoryId={row.categoryId || fallbackCategory}
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
        {categories.isError && (
          <Alert>Não foi possível carregar os tipos de documento.</Alert>
        )}
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
            disabled={sending || toSend === 0 || categories.isPending}
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
