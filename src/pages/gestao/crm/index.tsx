import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import {
  FunnelStages,
  FunnelStagesSkeleton,
} from "@/components/molecules/funnel-stages";
import { PageHeader } from "@/components/molecules/page-header";
import { Pagination } from "@/components/molecules/pagination";
import {
  CrmOverview,
  CrmOverviewSkeleton,
} from "@/components/organisms/crm-overview";
import { LeadFilters } from "@/components/organisms/lead-filters";
import { LeadList } from "@/components/organisms/lead-list";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { QueryError } from "@/components/organisms/query-error";
import { useLeadFunnel } from "@/hooks/api/gestao/crm/useLeadFunnel";
import { useLeads } from "@/hooks/api/gestao/crm/useLeads";
import { ROUTES } from "@/constants/routes";
import { useLeadFilters } from "@/hooks/ui/useLeadFilters";

/** CRM: the funnel, where leads come from, and the list. */
export function CrmPage() {
  const { filters, setSearch, setStatus, setTest, setPage } = useLeadFilters();
  const funnel = useLeadFunnel();
  const leads = useLeads(filters);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="CRM"
        actions={
          <Button asChild size="sm">
            <Link to={ROUTES.leadNew}>
              <Plus />
              Novo lead
            </Link>
          </Button>
        }
      />
      <QueryBoundary
        query={funnel}
        label="Carregando funil…"
        skeleton={<FunnelStagesSkeleton />}
      >
        {(data) => (
          <Box className="space-y-1">
            <FunnelStages
              funnel={data}
              selected={filters.status}
              onSelect={setStatus}
            />
            {filters.test && (
              // The funnel never counts sandbox leads; the list now shows them.
              <Text size="xs" tone="muted">
                Os contadores do funil não incluem leads de teste.
              </Text>
            )}
          </Box>
        )}
      </QueryBoundary>
      <LeadFilters
        filters={filters}
        onSearch={setSearch}
        onTestChange={setTest}
      />
      {leads.isError ? (
        <QueryError error={leads.error} onRetry={() => leads.refetch()} />
      ) : (
        <LeadList
          leads={leads.data?.items}
          isLoading={leads.isPending}
          isRefreshing={leads.isPlaceholderData}
        />
      )}
      {leads.data && leads.data.total > 0 && (
        <Pagination
          page={leads.data.page}
          pageSize={leads.data.pageSize}
          total={leads.data.total}
          onPageChange={setPage}
        />
      )}
      <QueryBoundary
        query={funnel}
        label="Carregando origens…"
        skeleton={<CrmOverviewSkeleton />}
      >
        {(data) => <CrmOverview funnel={data} />}
      </QueryBoundary>
    </Box>
  );
}
