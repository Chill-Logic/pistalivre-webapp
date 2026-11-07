import { Target } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { LeadActivities } from "@/components/organisms/lead-activities";
import { LeadChain } from "@/components/organisms/lead-chain";
import { LeadJourneyCard } from "@/components/organisms/lead-journey-card";
import { LeadLostCard } from "@/components/organisms/lead-lost-card";
import {
  LeadSummary,
  LeadSummarySkeleton,
} from "@/components/organisms/lead-summary";
import { QueryError } from "@/components/organisms/query-error";
import {
  ListCardSkeleton,
  ListRowSkeleton,
} from "@/components/organisms/list-card";
import { LeadDetailLayout } from "@/components/templates/lead-detail-layout";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useLead } from "@/hooks/api/gestao/crm/useLead";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function LeadDetailPage() {
  const { id = "" } = useParams();
  const lead = useLead(id);
  const backTo = useBackToList(ROUTES.crm);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="CRM" />
      {lead.isPending && (
        <SkeletonRegion label="Carregando lead…">
          <LeadDetailLayout
            summary={<LeadSummarySkeleton />}
            activities={<ListCardSkeleton rows={3} row={<ListRowSkeleton />} />}
            side={<ListCardSkeleton rows={3} row={<ListRowSkeleton />} />}
          />
        </SkeletonRegion>
      )}
      {lead.isError &&
        (isNotFound(lead.error) ? (
          <EmptyState
            icon={Target}
            title="Lead não encontrado"
            description="Ele pode ter sido excluído ou o endereço está errado."
          />
        ) : (
          <QueryError error={lead.error} onRetry={() => lead.refetch()} />
        ))}
      {lead.data && (
        <LeadDetailLayout
          summary={<LeadSummary lead={lead.data} />}
          activities={<LeadActivities activities={lead.data.activities} />}
          side={
            <Box className="space-y-6">
              <LeadLostCard lead={lead.data} />
              <LeadJourneyCard lead={lead.data} />
              <LeadChain chain={lead.data.chain} />
            </Box>
          }
        />
      )}
    </Box>
  );
}
