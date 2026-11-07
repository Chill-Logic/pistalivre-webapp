import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { PageHeader } from "@/components/molecules/page-header";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryError } from "@/components/organisms/query-error";
import { SupplierFilters } from "@/components/organisms/supplier-filters";
import { SupplierList } from "@/components/organisms/supplier-list";
import { SupplierTable } from "@/components/organisms/supplier-table";
import { ROUTES } from "@/constants/routes";
import { useSupplierList } from "@/hooks/api/gestao/suppliers/useSuppliers";
import { useListView } from "@/hooks/ui/useListView";
import { useSupplierFilters } from "@/hooks/ui/useSupplierFilters";

export function SuppliersPage() {
  const { filters, setSearch, setScope, setActive, setPage, setPageSize } =
    useSupplierFilters();
  const { view, setView, isDesktop } = useListView();
  const suppliers = useSupplierList(filters, isDesktop);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Fornecedores"
        actions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <Button asChild>
              <Link to={ROUTES.supplierNew}>
                <Plus />
                Novo fornecedor
              </Link>
            </Button>
          </>
        }
      />
      <SupplierFilters
        filters={filters}
        onSearch={setSearch}
        onScopeChange={setScope}
        onActiveChange={setActive}
      />
      {suppliers.isError ? (
        <QueryError
          error={suppliers.error}
          onRetry={() => suppliers.refetch()}
        />
      ) : view === "tabela" ? (
        <SupplierTable
          suppliers={suppliers.items}
          isLoading={suppliers.isPending}
          isRefreshing={suppliers.isRefreshing}
        />
      ) : (
        <SupplierList
          suppliers={suppliers.items}
          isLoading={suppliers.isPending}
          isRefreshing={suppliers.isRefreshing}
        />
      )}
      <ListFooter
        result={suppliers}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
