import { Box } from "@/components/atoms/box";
import { LoadMoreSentinel } from "@/components/molecules/load-more-sentinel";
import { PageSizeSelect } from "@/components/molecules/page-size-select";
import { Pagination } from "@/components/molecules/pagination";
import type { PagedListResult } from "@/hooks/ui/usePagedList";

type ListFooterProps<Item, Page> = {
  result: PagedListResult<Item, Page>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

/**
 * Below a resource list: numbered pages + page size on the desktop, "load
 * more on scroll" on the phone. Same for the card and the table view.
 */
export function ListFooter<Item, Page>({
  result,
  onPageChange,
  onPageSizeChange,
}: ListFooterProps<Item, Page>) {
  if (result.isPending || result.isError || result.total === 0) return null;

  if (result.mode === "infinite") {
    return (
      <LoadMoreSentinel
        loaded={result.items?.length ?? 0}
        total={result.total}
        hasNextPage={result.hasNextPage}
        isFetchingNextPage={result.isFetchingNextPage}
        onLoadMore={result.fetchNextPage}
      />
    );
  }

  return (
    <Box className="flex flex-wrap items-center justify-between gap-4">
      <Box className="min-w-0 flex-1">
        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          onPageChange={onPageChange}
        />
      </Box>
      <PageSizeSelect value={result.pageSize} onChange={onPageSizeChange} />
    </Box>
  );
}
