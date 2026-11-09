import { ExternalLink, FilePlus2, FileText, RefreshCw } from "lucide-react";
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
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { currentVehicles } from "@/helpers/partner";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import { usePartnerContractDocument } from "@/hooks/api/gestao/partners/usePartners";
import type { PartnerContract } from "@/types/partner";
import { formatDateTime, formatFileSize } from "@/utils/format";

/**
 * The contract's PDF: open it or generate it again, or "Montar contrato"
 * (the editor with the AI assistant). The server asks for a vehicle in the
 * contract, so without one the button explains why it waits.
 */
export function PartnerContractDocumentCard({
  contract,
}: {
  contract: PartnerContract;
}) {
  const query = usePartnerContractDocument(contract.id);
  const { view } = useFileActions();
  const editorUrl = routeTo.partnerContractDocument(contract.id);
  const hasVehicles = currentVehicles(contract).length > 0;

  if (query.isPending) return <PartnerContractDocumentCardSkeleton />;

  const file = query.data?.document ?? null;
  const generatedAt = query.data?.generatedAt ?? file?.createdAt ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Documento do contrato</CardTitle>
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
                  {generatedAt && `Gerado em ${formatDateTime(generatedAt)}`}
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
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto sm:flex-1"
              >
                <Link to={editorUrl}>
                  <RefreshCw />
                  Gerar de novo
                </Link>
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Text tone="muted">
              Monte o contrato a partir do texto-base com os dados deste
              contrato, ajuste com o assistente de IA e gere o PDF com as
              assinaturas.
            </Text>
            {!hasVehicles && (
              <Text size="xs" tone="muted">
                Para montar o documento, inclua ao menos um veículo no contrato.
              </Text>
            )}
            {hasVehicles ? (
              <Button asChild className="w-full sm:w-auto">
                <Link to={editorUrl}>
                  <FilePlus2 />
                  Montar contrato
                </Link>
              </Button>
            ) : (
              <Button className="w-full sm:w-auto" disabled>
                <FilePlus2 />
                Montar contrato
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
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
