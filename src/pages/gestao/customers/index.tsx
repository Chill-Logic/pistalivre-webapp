import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { PageHeader } from "@/components/molecules/page-header";
import { Pagination } from "@/components/molecules/pagination";
import { CustomerFilters } from "@/components/organisms/customer-filters";
import { CustomerList } from "@/components/organisms/customer-list";
import { QueryError } from "@/components/organisms/query-error";
import { useCustomers } from "@/hooks/api/gestao/customers/useCustomers";
import { ROUTES } from "@/constants/routes";
import { useCustomerFilters } from "@/hooks/ui/useCustomerFilters";

export function CustomersPage() {
  const { filters, setSearch, setStatus, setTest, setPage } =
    useCustomerFilters();
  const customers = useCustomers(filters);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Clientes"
        actions={
          <Button asChild>
            <Link to={ROUTES.customerNew}>
              <Plus />
              Novo cliente
            </Link>
          </Button>
        }
      />
      <CustomerFilters
        filters={filters}
        onSearch={setSearch}
        onStatusChange={setStatus}
        onTestChange={setTest}
      />
      {customers.isError ? (
        <QueryError
          error={customers.error}
          onRetry={() => customers.refetch()}
        />
      ) : (
        <CustomerList
          customers={customers.data?.items}
          isLoading={customers.isPending}
          isRefreshing={customers.isPlaceholderData}
        />
      )}
      {customers.data && customers.data.total > 0 && (
        <Pagination
          page={customers.data.page}
          pageSize={customers.data.pageSize}
          total={customers.data.total}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
}
