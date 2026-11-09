import { BriefcaseBusiness } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  PartnerForm,
  PartnerFormSkeleton,
} from "@/components/organisms/partner-form";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { usePartner } from "@/hooks/api/gestao/partners/usePartners";

export function PartnerEditPage() {
  const { id = "" } = useParams();
  const partner = usePartner(id);
  const detailUrl = routeTo.partner(id);

  return (
    <Box className="space-y-4">
      <BackLink to={detailUrl} label={partner.data?.name ?? "Parceiro"} />
      <PageHeader title="Editar parceiro" />
      <PartnerEditContent id={id} />
    </Box>
  );
}

function PartnerEditContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const partner = usePartner(id);
  const detailUrl = routeTo.partner(id);

  if (partner.isPending) {
    return (
      <SkeletonRegion label="Carregando parceiro…">
        <PartnerFormSkeleton />
      </SkeletonRegion>
    );
  }
  if (partner.isError) {
    return isNotFound(partner.error) ? (
      <EmptyState icon={BriefcaseBusiness} title="Parceiro não encontrado" />
    ) : (
      <QueryError error={partner.error} onRetry={() => partner.refetch()} />
    );
  }
  return (
    <PartnerForm
      key={partner.data.id}
      partner={partner.data}
      cancelTo={detailUrl}
      onSaved={() => navigate(detailUrl, { replace: true })}
    />
  );
}
