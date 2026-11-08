import { FileText, Plus, Target, UserPlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { LeadActivities } from "@/components/organisms/lead-activities";
import { LeadActivityDialog } from "@/components/organisms/lead-activity-dialog";
import { LeadAttributionCard } from "@/components/organisms/lead-attribution-card";
import { LeadChain } from "@/components/organisms/lead-chain";
import { LeadProposalsCard } from "@/components/organisms/lead-proposals-card";
import { LeadDeleteButton } from "@/components/organisms/lead-delete-button";
import { LeadJourneyCard } from "@/components/organisms/lead-journey-card";
import { LeadLostCard } from "@/components/organisms/lead-lost-card";
import { LeadNotesCard } from "@/components/organisms/lead-notes-card";
import {
  LeadStageCard,
  LeadStageCardSkeleton,
} from "@/components/organisms/lead-stage-card";
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
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useCrmOptions } from "@/hooks/api/gestao/crm/useCrmOptions";
import { useLead } from "@/hooks/api/gestao/crm/useLead";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function LeadDetailPage() {
  const { id = "" } = useParams();
  const lead = useLead(id);
  const options = useCrmOptions();
  const backTo = useBackToList(ROUTES.crm);

  return (
    <Box className="space-y-4">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <BackLink to={backTo} label="CRM" />
        {lead.data && (
          <Box className="flex flex-wrap items-center gap-2">
            <LeadDeleteButton leadId={lead.data.id} name={lead.data.name} />
            {!lead.data.customerId && lead.data.status !== "LOST" && (
              <Button asChild size="sm">
                <Link to={routeTo.newCustomerFromLead(lead.data.id)}>
                  <UserPlus />
                  Converter em cliente
                </Link>
              </Button>
            )}
          </Box>
        )}
      </Box>
      {lead.isPending && (
        <SkeletonRegion label="Carregando lead…">
          <LeadDetailLayout
            summary={<LeadSummarySkeleton />}
            proposals={<ListCardSkeleton rows={1} row={<ListRowSkeleton />} />}
            activities={<ListCardSkeleton rows={3} row={<ListRowSkeleton />} />}
            side={
              <Box className="space-y-6">
                <LeadStageCardSkeleton />
                <ListCardSkeleton rows={3} row={<ListRowSkeleton />} />
              </Box>
            }
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
          proposals={
            <LeadProposalsCard
              leadId={lead.data.id}
              proposals={lead.data.proposals}
              action={
                lead.data.status !== "LOST" && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      to={`${ROUTES.proposalNew}?lead=${encodeURIComponent(lead.data.id)}`}
                    >
                      <FileText />
                      Emitir proposta
                    </Link>
                  </Button>
                )
              }
            />
          }
          activities={
            <LeadActivities
              leadId={lead.data.id}
              activities={lead.data.activities}
              action={
                options.data && (
                  <LeadActivityDialog
                    leadId={lead.data.id}
                    types={options.data.activityTypes}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Plus />
                        Registrar atividade
                      </Button>
                    }
                  />
                )
              }
            />
          }
          side={
            <Box className="space-y-6">
              {options.data ? (
                // Keyed: reopening navigates to the copy, whose stage differs.
                <LeadStageCard
                  key={`${lead.data.id}-${lead.data.status}`}
                  lead={lead.data}
                  options={options.data}
                />
              ) : options.isError ? (
                <QueryError
                  error={options.error}
                  onRetry={() => options.refetch()}
                />
              ) : (
                <LeadStageCardSkeleton />
              )}
              <LeadNotesCard leadId={lead.data.id} notes={lead.data.notes} />
              <LeadLostCard lead={lead.data} />
              <LeadJourneyCard lead={lead.data} />
              <LeadAttributionCard lead={lead.data} />
              <LeadChain chain={lead.data.chain} />
            </Box>
          }
        />
      )}
    </Box>
  );
}
