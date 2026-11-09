import { Bike, FileText } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { PartnerContractEditor } from "@/components/organisms/partner-contract-editor";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { currentVehicles } from "@/helpers/partner";
import {
  usePartnerContract,
  usePartnerContractDocument,
  usePartnerContractDocumentDraft,
} from "@/hooks/api/gestao/partners/usePartners";
import { formatDateTime } from "@/utils/format";

/**
 * "Montar contrato" of a partner contract: the base text merged with its
 * terms and motos, the AI assistant beside it, "Visualizar PDF" and "Gerar
 * PDF e salvar" (back to the contract). Needs a moto in the contract.
 */
export function PartnerContractDocumentPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const contract = usePartnerContract(id);
  const hasVehicles = contract.data
    ? currentVehicles(contract.data).length > 0
    : false;
  const draft = usePartnerContractDocumentDraft(id, hasVehicles);
  const current = usePartnerContractDocument(hasVehicles ? id : "");
  const contractUrl = routeTo.partnerContract(id);
  const generatedAt = current.data?.document
    ? (current.data.generatedAt ?? current.data.document.createdAt)
    : null;

  return (
    <Box className="space-y-4">
      <BackLink
        to={contract.data ? contractUrl : ROUTES.partners}
        label={contract.data?.code ?? "Contrato"}
      />
      <PageHeader title="Documento do contrato" />

      {(contract.isPending || (hasVehicles && draft.isPending)) && (
        <SkeletonRegion label="Montando o contrato…">
          <PartnerContractEditorSkeleton />
        </SkeletonRegion>
      )}

      {contract.isError &&
        (isNotFound(contract.error) ? (
          <EmptyState
            icon={FileText}
            title="Contrato não encontrado"
            description="Ele pode ter sido excluído ou o endereço está errado."
          />
        ) : (
          <QueryError
            error={contract.error}
            onRetry={() => contract.refetch()}
          />
        ))}

      {contract.data && !hasVehicles && (
        <EmptyState
          icon={Bike}
          title="Inclua as motos antes"
          description="O documento descreve as motos do contrato: inclua ao menos uma para montá-lo."
          action={
            <Button asChild variant="outline">
              <Link to={contractUrl}>Voltar ao contrato</Link>
            </Button>
          }
        />
      )}

      {hasVehicles && draft.isError && (
        <QueryError error={draft.error} onRetry={() => draft.refetch()} />
      )}

      {hasVehicles && draft.data && (
        <>
          {generatedAt && (
            <Alert variant="info" role="note">
              Este contrato já tem um PDF, gerado em{" "}
              {formatDateTime(generatedAt)}. Gerar de novo passa a valer o novo;
              o anterior fica guardado.
            </Alert>
          )}
          <PartnerContractEditor
            contractId={id}
            initialHtml={draft.data.html}
            aiEnabled={draft.data.aiEnabled}
            cancelTo={contractUrl}
            onSaved={() => navigate(contractUrl, { replace: true })}
          />
        </>
      )}
    </Box>
  );
}

function PartnerContractEditorSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4 md:pt-6">
        <Box className="space-y-2">
          <Skeleton shape="text" className="w-full text-sm" />
          <Skeleton shape="text" className="w-2/3 text-sm" />
        </Box>
        <Skeleton shape="text" className="w-32 text-sm" />
        <Skeleton className="h-10" />
        <Skeleton className="h-96" />
        <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Skeleton className="h-11 sm:w-36 md:h-9" />
          <Skeleton className="h-11 sm:w-40 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
