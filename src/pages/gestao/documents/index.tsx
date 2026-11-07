import { Box } from "@/components/atoms/box";
import { Breadcrumbs } from "@/components/molecules/breadcrumbs";
import { PageHeader } from "@/components/molecules/page-header";
import { SearchInput } from "@/components/molecules/search-input";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  DocumentBrowser,
  DocumentBrowserSkeleton,
} from "@/components/organisms/document-browser";
import { DocumentSearchResults } from "@/components/organisms/document-search-results";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { QueryError } from "@/components/organisms/query-error";
import { useDocumentSearch } from "@/hooks/api/gestao/documents/useDocumentSearch";
import { useDocumentTree } from "@/hooks/api/gestao/documents/useDocumentTree";
import { useDocumentBrowser } from "@/hooks/ui/useDocumentBrowser";

/** Every document, as folders (owner → … → category). Read-only. */
export function DocumentsPage() {
  const { path, query, openFolder, setQuery } = useDocumentBrowser();
  const tree = useDocumentTree(path);
  const search = useDocumentSearch(query);
  const searching = query.trim().length >= 2;

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Documentos" />
      <SearchInput
        value={query}
        onSearch={setQuery}
        placeholder="Buscar em todos os documentos"
      />
      {searching ? (
        <QueryBoundary
          query={search}
          label="Buscando documentos…"
          skeleton={<DocumentBrowserSkeleton />}
        >
          {(data) => (
            <DocumentSearchResults search={data} onOpenFolder={openFolder} />
          )}
        </QueryBoundary>
      ) : (
        <>
          {tree.data && (
            <Breadcrumbs crumbs={tree.data.breadcrumbs} onOpen={openFolder} />
          )}
          {tree.isPending && (
            <SkeletonRegion label="Carregando pasta…">
              <DocumentBrowserSkeleton />
            </SkeletonRegion>
          )}
          {tree.isError && (
            <QueryError error={tree.error} onRetry={() => tree.refetch()} />
          )}
          {tree.data && (
            <DocumentBrowser
              tree={tree.data}
              onOpen={openFolder}
              isRefreshing={tree.isPlaceholderData}
            />
          )}
        </>
      )}
    </Box>
  );
}
