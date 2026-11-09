import { BriefcaseBusiness, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { AdminOnly } from "@/components/organisms/admin-only";
import {
  PartnerAccessCard,
  PartnerAccessCardSkeleton,
} from "@/components/organisms/partner-access-card";
import {
  PartnerContractsCard,
  PartnerContractsCardSkeleton,
} from "@/components/organisms/partner-contracts-card";
import { PartnerDeleteButton } from "@/components/organisms/partner-delete-button";
import {
  PartnerSummary,
  PartnerSummarySkeleton,
} from "@/components/organisms/partner-summary";
import { QueryError } from "@/components/organisms/query-error";
import { PartnerDetailLayout } from "@/components/templates/partner-detail-layout";
import { PARTNERS_ADMIN_ONLY } from "@/constants/partner";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { usePartner } from "@/hooks/api/gestao/partners/usePartners";
import { useBackToList } from "@/hooks/ui/useBackToList";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

export function PartnerDetailPage() {
  const { id = "" } = useParams();
  const { isAdmin } = useUserPermissions();
  const backTo = useBackToList(ROUTES.partners);
  const partner = usePartner(isAdmin ? id : "");

  return (
    <Box className="space-y-4">
      <Box className="flex items-center justify-between gap-2">
        <BackLink to={backTo} label="Parceiros" />
        {partner.data && (
          <Box className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.editPartner(partner.data.id)}>
                <Pencil />
                Editar
              </Link>
            </Button>
            {partner.data.contracts.length === 0 && (
              <PartnerDeleteButton
                partnerId={partner.data.id}
                name={partner.data.name}
              />
            )}
          </Box>
        )}
      </Box>
      <AdminOnly description={PARTNERS_ADMIN_ONLY}>
        {partner.isPending && (
          <SkeletonRegion label="Carregando parceiro…">
            <PartnerDetailLayout
              summary={<PartnerSummarySkeleton />}
              access={<PartnerAccessCardSkeleton />}
              contracts={<PartnerContractsCardSkeleton />}
            />
          </SkeletonRegion>
        )}
        {partner.isError &&
          (isNotFound(partner.error) ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="Parceiro não encontrado"
              description="Ele pode ter sido excluído ou o endereço está errado."
            />
          ) : (
            <QueryError
              error={partner.error}
              onRetry={() => partner.refetch()}
            />
          ))}
        {partner.data && (
          <PartnerDetailLayout
            summary={<PartnerSummary partner={partner.data} />}
            access={<PartnerAccessCard partner={partner.data} />}
            contracts={
              <PartnerContractsCard
                partnerId={partner.data.id}
                contracts={partner.data.contracts}
              />
            }
          />
        )}
      </AdminOnly>
    </Box>
  );
}
