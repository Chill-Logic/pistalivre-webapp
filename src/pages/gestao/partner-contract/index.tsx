import { FileText, Pencil } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { PartnerContractDeleteButton } from "@/components/organisms/partner-contract-delete-button";
import {
  PartnerContractDocumentCard,
  PartnerContractDocumentCardSkeleton,
} from "@/components/organisms/partner-contract-document-card";
import {
  PartnerContractProposalCard,
  PartnerContractProposalCardSkeleton,
} from "@/components/organisms/partner-contract-proposal-card";
import {
  PartnerContractStatusCard,
  PartnerContractStatusCardSkeleton,
} from "@/components/organisms/partner-contract-status-card";
import {
  PartnerContractSummary,
  PartnerContractSummarySkeleton,
} from "@/components/organisms/partner-contract-summary";
import {
  PartnerContractVehiclesCard,
  PartnerContractVehiclesCardSkeleton,
} from "@/components/organisms/partner-contract-vehicles-card";
import { QueryError } from "@/components/organisms/query-error";
import { PartnerContractLayout } from "@/components/templates/partner-contract-layout";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { usePartnerContract } from "@/hooks/api/gestao/partners/usePartners";

export function PartnerContractPage() {
  const { id = "" } = useParams();
  const contract = usePartnerContract(id);
  const data = contract.data;
  // Back from "Cadastrar novo veículo": `?incluir=<vehicleId>`.
  const [searchParams, setSearchParams] = useSearchParams();
  const includeVehicleId = searchParams.get("incluir");
  const clearInclude = () =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("incluir");
        return next;
      },
      { replace: true },
    );

  return (
    <Box className="space-y-4">
      <Box className="flex items-center justify-between gap-2">
        <BackLink
          to={data ? routeTo.partner(data.partner.id) : ROUTES.partners}
          label={data?.partner.name ?? "Parceiros"}
        />
        {data?.status === "DRAFT" && (
          <Box className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.editPartnerContract(data.id)}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <PartnerContractDeleteButton
              contractId={data.id}
              code={data.code}
              partnerId={data.partner.id}
            />
          </Box>
        )}
      </Box>
      {contract.isPending && (
        <SkeletonRegion label="Carregando contrato…">
          <PartnerContractLayout
            summary={<PartnerContractSummarySkeleton />}
            proposal={<PartnerContractProposalCardSkeleton />}
            status={<PartnerContractStatusCardSkeleton />}
            document={<PartnerContractDocumentCardSkeleton />}
            vehicles={<PartnerContractVehiclesCardSkeleton />}
          />
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
      {data && (
        <PartnerContractLayout
          summary={<PartnerContractSummary contract={data} />}
          proposal={<PartnerContractProposalCard contract={data} />}
          status={<PartnerContractStatusCard contract={data} />}
          document={<PartnerContractDocumentCard contract={data} />}
          vehicles={
            <PartnerContractVehiclesCard
              contract={data}
              includeVehicleId={includeVehicleId}
              onIncludeUsed={clearInclude}
            />
          }
        />
      )}
    </Box>
  );
}
