import { ExternalLink, FilePen, FilePlus2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { TextLink } from "@/components/molecules/text-link";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { currentVehicles } from "@/helpers/partner";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import {
  usePartnerContractDocument,
  usePartnerContractInstruments,
} from "@/hooks/api/gestao/partners/usePartners";
import type { PartnerContract, PartnerContractInstrument } from "@/types/partner";
import { formatDateTime, formatFileSize } from "@/utils/format";

/**
 * The contract's PDF — the one of the last proposal sent (each version
 * generates its own). On a draft, "Montar contrato"/"Editar texto" opens the
 * living draft (text saved on the server) with the AI assistant, which also
 * adjusts the terms and the calculator; from there it goes to the partner's
 * review or straight to signature (the vehicles are asked for at sending).
 * Active or ended: only the PDF.
 */
export function PartnerContractDocumentCard({
  contract,
}: {
  contract: PartnerContract;
}) {
  const query = usePartnerContractDocument(contract.id);
  // The documents that go with the contract (contribution term, "Outro termo"), each with its own PDF.
  const instruments = usePartnerContractInstruments(contract.id);
  const items = instruments.data?.items ?? [];
  const canHaveContribution = Boolean(
    instruments.data?.available.some((a) => a.kind === "CONTRIBUTION_TERM"),
  );
  const { view } = useFileActions();
  const editorUrl = routeTo.partnerContractDocument(contract.id);
  const hasVehicles = currentVehicles(contract).length > 0;
  const isDraft = contract.status === "DRAFT";

  if (query.isPending) return <PartnerContractDocumentCardSkeleton />;

  const file = query.data?.document ?? null;
  const generatedAt = query.data?.generatedAt ?? file?.createdAt ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {items.length ? "Documentos do contrato" : "Documento do contrato"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isError ? (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        ) : file ? (
          <>
            <Box className="flex items-start gap-3 rounded-md border bg-muted/40 p-3">
              <FileText
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden
              />
              <Box className="min-w-0 space-y-0.5">
                <Text weight="medium" className="truncate">
                  {file.fileName}
                </Text>
                <Text size="xs" tone="muted">
                  {generatedAt &&
                    `Da última proposta, gerado em ${formatDateTime(generatedAt)}`}
                  {file.size > 0 && ` · ${formatFileSize(file.size)}`}
                </Text>
              </Box>
            </Box>
            <Box className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="w-full sm:w-auto sm:flex-1"
                onClick={() => view.mutate(file)}
                disabled={view.isPending}
              >
                {view.isPending ? (
                  <Spinner className="text-primary-foreground" />
                ) : (
                  <ExternalLink />
                )}
                Abrir PDF
              </Button>
              {isDraft && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto sm:flex-1"
                >
                  <Link to={editorUrl}>
                    <FilePen />
                    Editar texto
                  </Link>
                </Button>
              )}
            </Box>
          </>
        ) : !isDraft ? (
          <Text tone="muted">Este contrato não tem PDF.</Text>
        ) : (
          <>
            <Text tone="muted">
              Monte o contrato conversando com o Livrinho: ele ajusta o texto,
              os termos e a calculadora enquanto vocês conversam (tudo fica
              salvo). Ao final, envie para a revisão do parceiro ou direto para
              assinatura.
            </Text>
            {!hasVehicles && (
              <Text size="xs" tone="muted">
                Antes de enviar, inclua ao menos um veículo no contrato.
              </Text>
            )}
            <Button asChild className="w-full sm:w-auto">
              <Link to={editorUrl}>
                <FilePlus2 />
                Montar contrato
              </Link>
            </Button>
          </>
        )}
        {items.map((instrument) => (
          <PartnerInstrumentRow
            key={instrument.id}
            instrument={instrument}
            editTo={isDraft ? `${editorUrl}?aba=termo-${instrument.id}` : null}
          />
        ))}
        {isDraft && (instruments.data?.available.length ?? 0) > 0 && (
          <Text size="sm" tone="muted">
            {/* Opens the editor with the "Incluir termo" dialog. */}
            <TextLink to={`${editorUrl}?incluir=1`}>Incluir termo</TextLink>:
            documento que vai junto com o contrato, como{" "}
            {canHaveContribution
              ? "o termo de reconhecimento de aporte ou outro termo com o nome que você der"
              : "um aditivo ou um termo de entrega, com o nome que você der"}
            .
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

/** A document that goes with the contract: its PDF (of the last proposal) and the text. */
function PartnerInstrumentRow({
  instrument,
  editTo,
}: {
  instrument: PartnerContractInstrument;
  editTo: string | null;
}) {
  const { view } = useFileActions();
  const file = instrument.document;
  const generatedAt = instrument.generatedAt ?? file?.createdAt ?? null;
  return (
    <Box className="space-y-2 border-t pt-4">
      <Box className="flex items-start gap-3">
        <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <Box className="min-w-0 space-y-0.5">
          <Text weight="medium" className="break-words">
            {instrument.title}
          </Text>
          <Text size="xs" tone="muted">
            {file && generatedAt
              ? `Da última proposta, gerado em ${formatDateTime(generatedAt)}`
              : "Vai junto com o contrato; o PDF sai no envio."}
          </Text>
        </Box>
      </Box>
      {(file || editTo) && (
        <Box className="flex flex-col gap-2 sm:flex-row">
          {file && (
            <Button
              variant="outline"
              className="w-full sm:w-auto sm:flex-1"
              onClick={() => view.mutate(file)}
              disabled={view.isPending}
            >
              {view.isPending ? <Spinner /> : <ExternalLink />}
              Abrir PDF
            </Button>
          )}
          {editTo && (
            <Button asChild variant="outline" className="w-full sm:w-auto sm:flex-1">
              <Link to={editTo}>
                <FilePen />
                Editar texto
              </Link>
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export function PartnerContractDocumentCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-44 text-base" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Box className="space-y-2">
          <Skeleton shape="text" className="w-full text-sm" />
          <Skeleton shape="text" className="w-2/3 text-sm" />
        </Box>
        <Skeleton className="h-11 w-40 md:h-9" />
      </CardContent>
    </Card>
  );
}
