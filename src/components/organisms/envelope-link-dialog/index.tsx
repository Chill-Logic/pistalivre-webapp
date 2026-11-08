import { FileText, Link2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { ROUTES, routeTo } from "@/constants/routes";
import { toApiError } from "@/helpers/api-error";
import {
  useEnvelopeDocuments,
  useImportEnvelope,
} from "@/hooks/api/gestao/signatures/useSignatureMutations";
import { usePdfDocumentOptions } from "@/hooks/ui/usePdfDocumentOptions";
import type {
  ProviderEnvelope,
  ProviderEnvelopeDocument,
} from "@/types/signature";

type Picked = Record<string, { id: string; label: string }>;

/**
 * Ties an envelope signed OUTSIDE the system to our PDFs: one of ours per
 * document of the envelope (blank = not linked). Status and signers come
 * from the provider; nothing is sent again.
 */
export function EnvelopeLinkDialog({
  envelope,
}: {
  envelope: ProviderEnvelope;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Vincular ${envelope.name}`}
        >
          <Link2 />
          Vincular
        </Button>
      </DialogTrigger>
      <DialogContent>
        {open && (
          <EnvelopeLinkBody envelope={envelope} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EnvelopeLinkBody({
  envelope,
  onDone,
}: {
  envelope: ProviderEnvelope;
  onDone: () => void;
}) {
  const documents = useEnvelopeDocuments(envelope.externalId);
  const importEnvelope = useImportEnvelope();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Picked>({});
  const [error, setError] = useState<string | null>(null);
  const chosen = Object.entries(picked).filter(([, value]) => value.id);
  const count = documents.data?.length ?? 0;

  const submit = () => {
    setError(null);
    importEnvelope.mutate(
      {
        externalId: envelope.externalId,
        documents: chosen.map(([externalDocumentId, value]) => ({
          externalDocumentId,
          documentId: value.id,
        })),
      },
      {
        onSuccess: (created) => {
          onDone();
          navigate(
            created.length === 1
              ? routeTo.signature(created[0].id)
              : ROUTES.signatures,
          );
        },
        onError: (err) => setError(toApiError(err).message),
      },
    );
  };

  return (
    <>
      <DialogTitle>Vincular envelope</DialogTitle>
      <DialogDescription>
        {envelope.name} ({envelope.status})
        {documents.data &&
          ` tem ${count === 1 ? "1 documento" : `${count} documentos`}`}
        . Escolha o PDF daqui que corresponde a cada um: quem ficar em branco
        não é vinculado. O status e os signatários vêm do Clicksign; nada é
        reenviado.
      </DialogDescription>
      <Box className="space-y-3">
        {documents.isPending && (
          <Box className="space-y-2" aria-busy>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </Box>
        )}
        {documents.isError && (
          <Alert>{toApiError(documents.error).message}</Alert>
        )}
        {documents.data?.length === 0 && (
          <Text tone="muted">Este envelope não tem documentos.</Text>
        )}
        {documents.data?.map((remote) => (
          <EnvelopeDocumentRow
            key={remote.id}
            remote={remote}
            value={picked[remote.id]}
            takenIds={chosen
              .filter(([key]) => key !== remote.id)
              .map(([, value]) => value.id)}
            onChange={(value) =>
              setPicked((current) => ({ ...current, [remote.id]: value }))
            }
          />
        ))}
        {error && <Alert>{error}</Alert>}
      </Box>
      <DialogFooter>
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            disabled={importEnvelope.isPending}
          >
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="button"
          disabled={importEnvelope.isPending || chosen.length === 0}
          onClick={submit}
        >
          {importEnvelope.isPending && (
            <Spinner className="text-primary-foreground" />
          )}
          {chosen.length > 1
            ? `Vincular ${chosen.length} documentos`
            : "Vincular"}
        </Button>
      </DialogFooter>
    </>
  );
}

/** One document of the envelope and the PDF of ours that matches it. */
function EnvelopeDocumentRow({
  remote,
  value,
  takenIds,
  onChange,
}: {
  remote: ProviderEnvelopeDocument;
  value?: { id: string; label: string };
  /** Already picked for another document (the same PDF twice → 422). */
  takenIds: string[];
  onChange: (value: { id: string; label: string }) => void;
}) {
  const pdfs = usePdfDocumentOptions();
  return (
    <Box className="space-y-2 rounded-md border p-3">
      <Box className="flex items-start gap-2">
        <FileText
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <Box className="min-w-0">
          <Text weight="medium" className="break-words">
            {remote.filename}
          </Text>
          <Text size="xs" tone="muted">
            no Clicksign · {remote.status}
          </Text>
        </Box>
      </Box>
      <RemoteCombobox
        label={`PDF daqui para ${remote.filename}`}
        value={value?.id ?? ""}
        selectedLabel={value?.label}
        options={pdfs.options.filter(
          (option) => !takenIds.includes(option.value),
        )}
        isLoading={pdfs.isLoading}
        search={pdfs.search}
        onSearchChange={pdfs.setSearch}
        onChange={(option) =>
          onChange({ id: option.value, label: option.label })
        }
        placeholder="PDF correspondente aqui…"
        searchPlaceholder="Buscar por nome do arquivo ou dono…"
      />
    </Box>
  );
}
