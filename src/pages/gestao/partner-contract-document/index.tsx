import { Car, FileText, Lock } from "lucide-react";
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
  usePartnerContractDocumentDraft,
  usePartnerContractProposals,
} from "@/hooks/api/gestao/partners/usePartners";
import { formatDateTime } from "@/utils/format";

/**
 * The text of a partner contract's proposal: the base text merged with its
 * terms and vehicles, the AI assistant beside it, "Visualizar PDF" and
 * "Enviar proposta ao parceiro" (back to the contract). Only a draft with a
 * vehicle: an active contract has its terms locked.
 */
export function PartnerContractDocumentPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const contract = usePartnerContract(id);
  const isDraft = contract.data?.status === "DRAFT";
  const hasVehicles = contract.data
    ? currentVehicles(contract.data).length > 0
    : false;
  const editable = isDraft && hasVehicles;
  const draft = usePartnerContractDocumentDraft(id, editable);
  const proposals = usePartnerContractProposals(editable ? id : "");
  const contractUrl = routeTo.partnerContract(id);
  const versions = proposals.data?.items ?? [];
  const pending = versions.find((version) => version.status === "PROPOSED");
  const accepted = proposals.data?.acceptedMatchesTerms
    ? versions.find((v) => v.id === proposals.data?.acceptedVersionId)
    : undefined;

  return (
    <Box className="space-y-4">
      <BackLink
        to={contract.data ? contractUrl : ROUTES.partners}
        label={contract.data?.code ?? "Contrato"}
      />
      <PageHeader title="Proposta ao parceiro" />

      {(contract.isPending || (editable && draft.isPending)) && (
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

      {contract.data && !isDraft && (
        <EmptyState
          icon={Lock}
          title="Os termos deste contrato estão travados"
          description="Ele já foi aceito e ativado: o texto não muda mais. Um veículo novo entra num contrato novo."
          action={
            <Button asChild variant="outline">
              <Link to={contractUrl}>Voltar ao contrato</Link>
            </Button>
          }
        />
      )}

      {isDraft && !hasVehicles && (
        <EmptyState
          icon={Car}
          title="Inclua os veículos antes"
          description="O documento descreve os veículos do contrato: inclua ao menos um para montá-lo."
          action={
            <Button asChild variant="outline">
              <Link to={contractUrl}>Voltar ao contrato</Link>
            </Button>
          }
        />
      )}

      {editable && draft.isError && (
        <QueryError error={draft.error} onRetry={() => draft.refetch()} />
      )}

      {editable && draft.data && (
        <>
          {pending ? (
            <Alert variant="info" role="note">
              A versão {pending.number}, enviada em{" "}
              {formatDateTime(pending.createdAt)}, está aguardando o parceiro.
              Enviar de novo a retira e manda esta no lugar.
            </Alert>
          ) : accepted ? (
            <Alert variant="info" role="note">
              O parceiro já aceitou a versão {accepted.number} com estes termos.
              Enviar outra pede um novo aceite.
            </Alert>
          ) : null}
          <PartnerContractEditor
            contractId={id}
            initialHtml={draft.data.html}
            aiEnabled={draft.data.aiEnabled}
            cancelTo={contractUrl}
            onSent={() => navigate(contractUrl, { replace: true })}
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
