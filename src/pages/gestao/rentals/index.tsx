import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { Pagination } from "@/components/molecules/pagination";
import { QueryError } from "@/components/organisms/query-error";
import { RentalFilters } from "@/components/organisms/rental-filters";
import { RentalList } from "@/components/organisms/rental-list";
import { useRentals } from "@/hooks/api/gestao/rentals/useRentals";
import { useRentalFilters } from "@/hooks/ui/useRentalFilters";

export function RentalsPage() {
  const { filters, setSearch, setStatus, setPage } = useRentalFilters();
  const rentals = useRentals(filters);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Locações" />
      <RentalFilters
        filters={filters}
        onSearch={setSearch}
        onStatusChange={setStatus}
      />
      {rentals.isError ? (
        <QueryError error={rentals.error} onRetry={() => rentals.refetch()} />
      ) : (
        <RentalList
          rentals={rentals.data?.items}
          isLoading={rentals.isPending}
          isRefreshing={rentals.isPlaceholderData}
        />
      )}
      {rentals.data && rentals.data.total > 0 && (
        <Pagination
          page={rentals.data.page}
          pageSize={rentals.data.pageSize}
          total={rentals.data.total}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
}
