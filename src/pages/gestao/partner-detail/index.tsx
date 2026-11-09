import { BriefcaseBusiness, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
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
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { usePartner } from "@/hooks/api/gestao/partners/usePartners";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function PartnerDetailPage() {
  const { id = "" } = useParams();
  const backTo = useBackToList(ROUTES.partners);
  const partner = usePartner(id);

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
    </Box>
  );
}
