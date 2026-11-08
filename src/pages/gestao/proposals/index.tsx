import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { PageHeader } from "@/components/molecules/page-header";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { ListFooter } from "@/components/organisms/list-footer";
import { ProposalFilters } from "@/components/organisms/proposal-filters";
import { ProposalList } from "@/components/organisms/proposal-list";
import { ProposalTable } from "@/components/organisms/proposal-table";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES } from "@/constants/routes";
import { useProposalList } from "@/hooks/api/gestao/proposals/useProposalList";
import { useListView } from "@/hooks/ui/useListView";
import { useProposalFilters } from "@/hooks/ui/useProposalFilters";

export function ProposalsPage() {
  const { filters, setSearch, setStatus, setPage, setPageSize } =
    useProposalFilters();
  const { view, setView, isDesktop } = useListView();
  const proposals = useProposalList(filters, isDesktop);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Propostas"
        actions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <Button asChild size="sm">
              <Link to={ROUTES.proposalNew}>
                <Plus />
                Nova proposta
              </Link>
            </Button>
          </>
        }
      />
      <ProposalFilters
        filters={filters}
        onSearch={setSearch}
        onStatusChange={setStatus}
      />
      {proposals.isError ? (
        <QueryError
          error={proposals.error}
          onRetry={() => proposals.refetch()}
        />
      ) : view === "tabela" ? (
        <ProposalTable
          proposals={proposals.items}
          isLoading={proposals.isPending}
          isRefreshing={proposals.isRefreshing}
        />
      ) : (
        <ProposalList
          proposals={proposals.items}
          isLoading={proposals.isPending}
          isRefreshing={proposals.isRefreshing}
        />
      )}
      <ListFooter
        result={proposals}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
