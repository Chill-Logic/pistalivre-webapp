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
import { ViewToggle } from "@/components/molecules/view-toggle";
import {
  CrmOverview,
  CrmOverviewSkeleton,
} from "@/components/organisms/crm-overview";
import { LeadFilters } from "@/components/organisms/lead-filters";
import { LeadList } from "@/components/organisms/lead-list";
import { LeadTable } from "@/components/organisms/lead-table";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { QueryError } from "@/components/organisms/query-error";
import { useLeadFunnel } from "@/hooks/api/gestao/crm/useLeadFunnel";
import { useLeadList } from "@/hooks/api/gestao/crm/useLeads";
import { ROUTES } from "@/constants/routes";
import { useLeadFilters } from "@/hooks/ui/useLeadFilters";
import { useListView } from "@/hooks/ui/useListView";

/** CRM: the funnel, where leads come from, and the list. */
export function CrmPage() {
  const { filters, setSearch, setStatus, setTest, setPage, setPageSize } =
    useLeadFilters();
  const { view, setView, isDesktop } = useListView();
  const funnel = useLeadFunnel();
  const leads = useLeadList(filters, isDesktop);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="CRM"
        actions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <Button asChild size="sm">
              <Link to={ROUTES.leadNew}>
                <Plus />
                Novo lead
              </Link>
            </Button>
          </>
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
      ) : view === "tabela" ? (
        <LeadTable
          leads={leads.items}
          isLoading={leads.isPending}
          isRefreshing={leads.isRefreshing}
        />
      ) : (
        <LeadList
          leads={leads.items}
          isLoading={leads.isPending}
          isRefreshing={leads.isRefreshing}
        />
      )}
      <ListFooter
        result={leads}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
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
