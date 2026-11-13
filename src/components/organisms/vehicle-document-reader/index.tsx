import { Camera, FileUp, ScanText } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { DropArea } from "@/components/atoms/drop-area";
import { FileInput } from "@/components/atoms/file-input";
import { usePasteFiles } from "@/hooks/ui/usePasteFiles";
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { errorMessage } from "@/helpers/api-error";
import { documentReadNotes } from "@/helpers/vehicle-form";
import { useReadVehicleDocument } from "@/hooks/api/gestao/vehicles/useReadVehicleDocument";
import type { VehicleDocumentResult } from "@/types/vehicle";

const DOCUMENT_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

type VehicleDocumentReaderProps = {
  /** The read fields, for the form to fill. */
  onRead: (result: VehicleDocumentResult) => void;
  disabled?: boolean;
};

/**
 * "Preencher pelo documento": a photo of the CRLV taken now (the phone opens
 * the camera) or a file from the gallery/PDF. The AI reads it, the form fills
 * and what deserves a look is listed below.
 */
export function VehicleDocumentReader({
  onRead,
  disabled = false,
}: VehicleDocumentReaderProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const read = useReadVehicleDocument();
  const [notes, setNotes] = useState<string[] | null>(null);

  const pick = (file: File | undefined) => {
    if (!file) return;
    setNotes(null);
    read.mutate(file, {
      onSuccess: (result) => {
        onRead(result);
        setNotes(documentReadNotes(result));
      },
    });
  };
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    pick(event.target.files?.[0]);
    // Picking the same file again must fire `change` again.
    event.target.value = "";
  };
  const busy = disabled || read.isPending;
  // Ctrl+V of a print of the CRLV reads it too.
  const paste = usePasteFiles((files) => pick(files[0]), !busy);

  return (
    <DropArea
      onFiles={(files) => pick(files[0])}
      disabled={busy}
      className="rounded-md"
      overlay={
        <Text weight="semibold" className="text-primary">
          Solte o CRLV para ler
        </Text>
      }
    >
      <Box
        {...paste}
        className="space-y-3 rounded-md border border-dashed p-3 md:p-4"
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
          aria-label="Escolher arquivo do documento"
          onChange={onChange}
        />
        <Box className="flex items-start gap-3">
          <ScanText className="mt-0.5 size-5 shrink-0 text-primary" />
          <Box className="min-w-0 space-y-0.5">
            <Text weight="semibold">Preencher pelo documento</Text>
            <Text size="xs" tone="muted">
              Foto ou PDF do CRLV. A IA preenche placa, tipo, categoria, modelo,
              cor, chassi, Renavam e titular; confira antes de salvar.
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
            Escolher arquivo
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
        {read.isError && <Alert>{errorMessage(read.error)}</Alert>}
        {notes && (
          <Alert variant={notes.length ? "warning" : "success"} role="status">
            {notes.length ? (
              <Box className="space-y-1">
                <Text size="sm" weight="medium">
                  Documento lido. Confira:
                </Text>
                <List className="list-disc space-y-0.5 pl-5">
                  {notes.map((note) => (
                    <ListItem key={note}>{note}</ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              "Documento lido. Confira os campos antes de salvar."
            )}
          </Alert>
        )}
      </Box>
    </DropArea>
  );
}
