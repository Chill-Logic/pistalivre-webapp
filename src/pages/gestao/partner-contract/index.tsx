import { FileText, Pencil } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { AdminOnly } from "@/components/organisms/admin-only";
import { PartnerContractDeleteButton } from "@/components/organisms/partner-contract-delete-button";
import { PartnerContractDialog } from "@/components/organisms/partner-contract-dialog";
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
import { PARTNERS_ADMIN_ONLY } from "@/constants/partner";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { usePartnerContract } from "@/hooks/api/gestao/partners/usePartners";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

export function PartnerContractPage() {
  const { id = "" } = useParams();
  const { isAdmin } = useUserPermissions();
  const contract = usePartnerContract(isAdmin ? id : "");
  const data = contract.data;

  return (
    <Box className="space-y-4">
      <Box className="flex items-center justify-between gap-2">
        <BackLink
          to={data ? routeTo.partner(data.partner.id) : ROUTES.partners}
          label={data?.partner.name ?? "Parceiros"}
        />
        {data && (
          <Box className="flex gap-2">
            <PartnerContractDialog
              partnerId={data.partner.id}
              contract={data}
              trigger={
                <Button variant="ghost" size="sm">
                  <Pencil />
                  Editar
                </Button>
              }
            />
            {data.status === "DRAFT" && (
              <PartnerContractDeleteButton
                contractId={data.id}
                code={data.code}
                partnerId={data.partner.id}
              />
            )}
          </Box>
        )}
      </Box>
      <AdminOnly description={PARTNERS_ADMIN_ONLY}>
        {contract.isPending && (
          <SkeletonRegion label="Carregando contrato…">
            <PartnerContractLayout
              summary={<PartnerContractSummarySkeleton />}
              status={<PartnerContractStatusCardSkeleton />}
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
            status={<PartnerContractStatusCard contract={data} />}
            vehicles={<PartnerContractVehiclesCard contract={data} />}
          />
        )}
      </AdminOnly>
    </Box>
  );
}
