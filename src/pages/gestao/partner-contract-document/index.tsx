import { Car, FileText, Lock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { PartnerContractWorkbench } from "@/components/organisms/partner-contract-workbench";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { currentVehicles } from "@/helpers/partner";
import {
  usePartnerContract,
  usePartnerContractProposals,
  usePartnerContractTextDraft,
} from "@/hooks/api/gestao/partners/usePartners";
import { formatDateTime } from "@/utils/format";

/**
 * The partner contract as a LIVING DRAFT: its text saved on the server, the
 * assistant beside it (it adjusts text, terms and calculator as you talk) and
 * the calculator under the chat, until someone sends it — to the partner's
 * review or straight to signature. Only a draft: once sent or active, locked.
 */
export function PartnerContractDocumentPage() {
  const { id = "" } = useParams();
  const contract = usePartnerContract(id);
  const isDraft = contract.data?.status === "DRAFT";
  const hasVehicles = contract.data
    ? currentVehicles(contract.data).length > 0
    : false;
  // The living draft is worked on from the start (the assistant can even add
  // the vehicles); sending asks for them.
  const editable = isDraft;
  const draft = usePartnerContractTextDraft(id, editable);
  const proposals = usePartnerContractProposals(editable ? id : "");
  const contractUrl = routeTo.partnerContract(id);
  const versions = proposals.data?.items ?? [];
  const pending = versions.find((version) => version.status === "PROPOSED");
  const accepted = proposals.data?.acceptedMatchesTerms
    ? versions.find((v) => v.id === proposals.data?.acceptedVersionId)
    : undefined;

  const header = (
    <Box className="space-y-2">
      <BackLink
        to={contract.data ? contractUrl : ROUTES.partners}
        label={contract.data?.code ?? "Contrato"}
      />
      <PageHeader title="Montar o contrato" />
    </Box>
  );
  const ready = editable && draft.data?.workable && contract.data;

  if (ready && contract.data && draft.data) {
    return (
      <PartnerContractWorkbench
        contract={contract.data}
        textDraft={draft.data}
        header={header}
        notices={
          <>
            {!hasVehicles && (
              <Alert variant="info" role="note" className="flex items-center gap-2">
                <Car className="size-4 shrink-0" aria-hidden />
                Ainda sem motos neste contrato: inclua na tela do contrato (ou
                peça ao Livrinho) antes de enviar.
              </Alert>
            )}
            {pending ? (
              <Alert variant="info" role="note">
                A versão {pending.number}, enviada em{" "}
                {formatDateTime(pending.createdAt)}, está aguardando o parceiro.
                Enviar de novo a retira e manda esta no lugar.
              </Alert>
            ) : accepted ? (
              <Alert variant="info" role="note">
                O parceiro já aceitou a versão {accepted.number} com estes
                termos. Enviar outra pede um novo aceite.
              </Alert>
            ) : null}
          </>
        }
      />
    );
  }

  return (
    <Box className="space-y-4">
      {header}

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

      {editable && draft.isError && (
        <QueryError error={draft.error} onRetry={() => draft.refetch()} />
      )}

      {editable && draft.data && !draft.data.workable && (
        <EmptyState
          icon={Lock}
          title="Este contrato já saiu daqui"
          description={draft.data.lockedReason ?? "O texto e os termos não mudam mais."}
          action={
            <Button asChild variant="outline">
              <Link to={contractUrl}>Voltar ao contrato</Link>
            </Button>
          }
        />
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
