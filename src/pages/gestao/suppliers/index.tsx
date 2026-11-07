import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { QueryError } from "@/components/organisms/query-error";
import { SupplierFilters } from "@/components/organisms/supplier-filters";
import { SupplierList } from "@/components/organisms/supplier-list";
import { useSuppliers } from "@/hooks/api/gestao/suppliers/useSuppliers";
import { useSupplierFilters } from "@/hooks/ui/useSupplierFilters";

export function SuppliersPage() {
  const { filters, setSearch, setScope, setActive } = useSupplierFilters();
  const suppliers = useSuppliers(filters);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Fornecedores" />
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
      ) : (
        <SupplierList
          suppliers={suppliers.data}
          isLoading={suppliers.isPending}
          isRefreshing={suppliers.isPlaceholderData}
        />
      )}
    </Box>
  );
}
