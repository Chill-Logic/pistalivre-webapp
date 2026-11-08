import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { ListFooter } from "@/components/organisms/list-footer";
import { SignatureCreateDialog } from "@/components/organisms/signature-create-dialog";
import { SignatureFilters } from "@/components/organisms/signature-filters";
import { SignatureList } from "@/components/organisms/signature-list";
import { SignatureTable } from "@/components/organisms/signature-table";
import { QueryError } from "@/components/organisms/query-error";
import { useSignatureList } from "@/hooks/api/gestao/signatures/useSignatureList";
import { useListView } from "@/hooks/ui/useListView";
import { useSignatureFilters } from "@/hooks/ui/useSignatureFilters";

export function SignaturesPage() {
  const { filters, setSearch, setStatus, setPage, setPageSize } =
    useSignatureFilters();
  const { view, setView, isDesktop } = useListView();
  const signatures = useSignatureList(filters, isDesktop);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Assinaturas"
        actions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <SignatureCreateDialog />
          </>
        }
      />
      <SignatureFilters
        filters={filters}
        onSearch={setSearch}
        onStatusChange={setStatus}
      />
      {signatures.isError ? (
        <QueryError
          error={signatures.error}
          onRetry={() => signatures.refetch()}
        />
      ) : view === "tabela" ? (
        <SignatureTable
          signatures={signatures.items}
          isLoading={signatures.isPending}
          isRefreshing={signatures.isRefreshing}
        />
      ) : (
        <SignatureList
          signatures={signatures.items}
          isLoading={signatures.isPending}
          isRefreshing={signatures.isRefreshing}
        />
      )}
      <ListFooter
        result={signatures}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
