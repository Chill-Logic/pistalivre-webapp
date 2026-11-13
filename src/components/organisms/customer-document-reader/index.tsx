import { Camera, FileUp, ScanText, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { DropArea } from "@/components/atoms/drop-area";
import { FileInput } from "@/components/atoms/file-input";
import { usePasteFiles } from "@/hooks/ui/usePasteFiles";
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { routeTo } from "@/constants/routes";
import { errorMessage } from "@/helpers/api-error";
import { useReadCustomerDocument } from "@/hooks/api/gestao/customers/useCustomerDocumentReader";
import type { CustomerDocumentResult } from "@/types/customer";

const DOCUMENT_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

const READ_LABEL: Record<CustomerDocumentResult["kind"], string> = {
  cnh: "CNH lida",
  rg: "RG lido",
  comprovante: "Comprovante de residência lido",
  outro: "Documento lido",
};

type ReadEntry = { name: string; result: CustomerDocumentResult };

type CustomerDocumentReaderProps = {
  /** What was read (the form fills it) and the file (saved with the customer). */
  onRead: (result: CustomerDocumentResult, file: File) => void;
  disabled?: boolean;
};

/**
 * "Preencher pelo documento" for a new customer: a photo taken now (the phone
 * opens the camera), a file, or files dropped here — CNH, RG, proof of
 * residence, one after the other. Each one fills what it has; the files are
 * saved in the customer's documents with the form.
 */
export function CustomerDocumentReader({
  onRead,
  disabled = false,
}: CustomerDocumentReaderProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const read = useReadCustomerDocument();
  const [entries, setEntries] = useState<ReadEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const readAll = async (files: File[]) => {
    setError(null);
    for (const file of files) {
      try {
        const result = await read.mutateAsync(file);
        onRead(result, file);
        setEntries((list) => [...list, { name: file.name, result }]);
      } catch (failure) {
        setError(`${file.name}: ${errorMessage(failure)}`);
      }
    }
  };
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    void readAll(Array.from(event.target.files ?? []));
    event.target.value = "";
  };
  const busy = disabled || read.isPending;
  const existing = entries.find((e) => e.result.existingCustomer)?.result
    .existingCustomer;

  // Ctrl+V of prints of the documents reads them too.
  const paste = usePasteFiles(
    (files) => void readAll(files),
    !(disabled ?? false),
  );
  return (
    <DropArea
      {...paste}
      onFiles={(files) => void readAll(files)}
      disabled={busy}
      className="space-y-3 rounded-md border border-dashed p-3 md:p-4"
      overlay={
        <Box className="flex flex-col items-center gap-1 text-primary">
          <Upload className="size-5" aria-hidden />
          <Text weight="semibold">Solte para ler</Text>
        </Box>
      }
    >
      <FileInput
        ref={cameraRef}
        accept="image/*"
        capture="environment"
        aria-label="Tirar foto do documento"
        onChange={onChange}
      />
      <FileInput
        ref={fileRef}
        accept={DOCUMENT_ACCEPT}
        multiple
        aria-label="Escolher arquivos dos documentos"
        onChange={onChange}
      />
      <Box className="flex items-start gap-3">
        <ScanText className="mt-0.5 size-5 shrink-0 text-primary" />
        <Box className="min-w-0 space-y-0.5">
          <Text weight="semibold">Preencher pelo documento</Text>
          <Text size="xs" tone="muted">
            Foto ou PDF da CNH, do RG ou do comprovante de residência (pode
            arrastar para cá). A IA preenche o que estiver no documento e os
            arquivos ficam nos documentos do cliente; confira antes de salvar.
          </Text>
        </Box>
      </Box>
      <Box className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="md:hidden"
          disabled={busy}
          onClick={() => cameraRef.current?.click()}
        >
          <Camera />
          Tirar foto
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <FileUp />
          Escolher arquivos
        </Button>
      </Box>
      {read.isPending && (
        <Box className="flex items-center gap-2">
          <Spinner />
          <Text size="sm" tone="muted">
            Lendo o documento…
          </Text>
        </Box>
      )}
      {error && <Alert>{error}</Alert>}
      {existing && (
        <Alert variant="warning">
          <Text size="sm">
            Este CPF já é de {existing.name}.{" "}
            <Link
              to={routeTo.customer(existing.id)}
              className="font-medium underline"
            >
              Abrir o cadastro
            </Link>{" "}
            em vez de criar outro.
          </Text>
        </Alert>
      )}
      {entries.map(({ name, result }, index) => (
        <Alert
          key={`${name}-${index}`}
          variant={result.review.length ? "warning" : "success"}
          role="status"
        >
          <Box className="space-y-1">
            <Text size="sm" weight="medium">
              {READ_LABEL[result.kind]} ({name})
              {result.review.length ? ". Confira:" : "."}
            </Text>
            {result.review.length > 0 && (
              <List className="list-disc space-y-0.5 pl-5">
                {result.review.map((note) => (
                  <ListItem key={note}>{note}</ListItem>
                ))}
              </List>
            )}
          </Box>
        </Alert>
      ))}
    </DropArea>
  );
}
