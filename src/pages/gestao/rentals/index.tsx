import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { PageHeader } from "@/components/molecules/page-header";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryError } from "@/components/organisms/query-error";
import { RentalFilters } from "@/components/organisms/rental-filters";
import { RentalTable } from "@/components/organisms/rental-table";
import { RentalList } from "@/components/organisms/rental-list";
import { ROUTES } from "@/constants/routes";
import { useRentalList } from "@/hooks/api/gestao/rentals/useRentals";
import { useListView } from "@/hooks/ui/useListView";
import { useRentalFilters } from "@/hooks/ui/useRentalFilters";

export function RentalsPage() {
  const { filters, setSearch, setStatus, setPage, setPageSize } =
    useRentalFilters();
  const { view, setView, isDesktop } = useListView();
  const rentals = useRentalList(filters, isDesktop);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Locações"
        actions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <Button asChild>
              <Link to={ROUTES.rentalNew}>
                <Plus />
                Nova locação
              </Link>
            </Button>
          </>
        }
      />
      <RentalFilters
        filters={filters}
        onSearch={setSearch}
        onStatusChange={setStatus}
      />
      {rentals.isError ? (
        <QueryError error={rentals.error} onRetry={() => rentals.refetch()} />
      ) : view === "tabela" ? (
        <RentalTable
          rentals={rentals.items}
          isLoading={rentals.isPending}
          isRefreshing={rentals.isRefreshing}
        />
      ) : (
        <RentalList
          rentals={rentals.items}
          isLoading={rentals.isPending}
          isRefreshing={rentals.isRefreshing}
        />
      )}
      <ListFooter
        result={rentals}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
