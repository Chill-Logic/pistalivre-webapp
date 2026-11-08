import { Link2, Plus } from "lucide-react";
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
import { TestLeadsDeleteButton } from "@/components/organisms/test-leads-delete-button";
import { useLeadFunnel } from "@/hooks/api/gestao/crm/useLeadFunnel";
import { useCrmOptions } from "@/hooks/api/gestao/crm/useCrmOptions";
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
  /** Under "nenhum lead": where leads start coming in. */
  const campaignLinksAction = (
    <Button asChild variant="outline" size="sm">
      <Link to={ROUTES.crmLinks}>
        <Link2 />
        Links de campanha
      </Link>
    </Button>
  );
  // The stage select of each row (until it loads, rows show the badge).
  const options = useCrmOptions();

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="CRM"
        actions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <TestLeadsDeleteButton />
            <Button
              asChild
              variant="outline"
              size="sm"
              aria-label="Links de campanha"
            >
              <Link to={ROUTES.crmLinks}>
                <Link2 />
                <Text inline size={null} className="hidden sm:inline">
                  Links de campanha
                </Text>
              </Link>
            </Button>
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
          options={options.data}
          isLoading={leads.isPending}
          isRefreshing={leads.isRefreshing}
          emptyAction={campaignLinksAction}
        />
      ) : (
        <LeadList
          leads={leads.items}
          options={options.data}
          isLoading={leads.isPending}
          isRefreshing={leads.isRefreshing}
          emptyAction={campaignLinksAction}
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
