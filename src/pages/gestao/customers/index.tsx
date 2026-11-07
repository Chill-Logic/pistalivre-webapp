import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { PageHeader } from "@/components/molecules/page-header";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { ListFooter } from "@/components/organisms/list-footer";
import { CustomerFilters } from "@/components/organisms/customer-filters";
import { CustomerTable } from "@/components/organisms/customer-table";
import { CustomerList } from "@/components/organisms/customer-list";
import { QueryError } from "@/components/organisms/query-error";
import { useCustomerList } from "@/hooks/api/gestao/customers/useCustomers";
import { ROUTES } from "@/constants/routes";
import { useCustomerFilters } from "@/hooks/ui/useCustomerFilters";
import { useListView } from "@/hooks/ui/useListView";

export function CustomersPage() {
  const { filters, setSearch, setStatus, setTest, setPage, setPageSize } =
    useCustomerFilters();
  const { view, setView, isDesktop } = useListView();
  const customers = useCustomerList(filters, isDesktop);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Clientes"
        actions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <Button asChild>
              <Link to={ROUTES.customerNew}>
                <Plus />
                Novo cliente
              </Link>
            </Button>
          </>
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
      ) : view === "tabela" ? (
        <CustomerTable
          customers={customers.items}
          isLoading={customers.isPending}
          isRefreshing={customers.isRefreshing}
        />
      ) : (
        <CustomerList
          customers={customers.items}
          isLoading={customers.isPending}
          isRefreshing={customers.isRefreshing}
        />
      )}
      <ListFooter
        result={customers}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
