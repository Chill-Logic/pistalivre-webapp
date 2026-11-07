import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { MOBILE_PAGE_SIZE } from "@/constants/pagination";
import type { Paginated } from "@/types/api";

type PagedFilters = { page: number; pageSize: number };

type UsePagedListOptions<Filters extends PagedFilters, Item> = {
  /** The resource's root key (e.g. queryKeys.vehicles.all), so one
   *  invalidation refreshes both modes. */
  baseKey: readonly unknown[];
  filters: Filters;
  fetch: (filters: Filters) => Promise<Paginated<Item>>;
  isDesktop: boolean;
};

export type PagedListResult<Item> = {
  mode: "pages" | "infinite";
  items: Item[] | undefined;
  total: number;
  page: number;
  pageSize: number;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
  /** Showing the previous page/filter while the next one loads. */
  isRefreshing: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
};

/**
 * One list, two ways to page: numbered pages with a chosen size on the
 * desktop, 10 at a time appended on scroll (infinite query) on the phone.
 * Only the active mode fetches.
 */
export function usePagedList<Filters extends PagedFilters, Item>({
  baseKey,
  filters,
  fetch,
  isDesktop,
}: UsePagedListOptions<Filters, Item>): PagedListResult<Item> {
  const pages = useQuery({
    queryKey: [...baseKey, "list", filters],
    queryFn: () => fetch(filters),
    placeholderData: keepPreviousData,
    enabled: isDesktop,
  });

  // Same criteria = same infinite list, whatever page the desktop was on.
  const criteria = { ...filters, page: 1, pageSize: MOBILE_PAGE_SIZE };
  const infinite = useInfiniteQuery({
    queryKey: [...baseKey, "infinite", criteria],
    queryFn: ({ pageParam }) =>
      fetch({ ...filters, page: pageParam, pageSize: MOBILE_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
    enabled: !isDesktop,
  });

  if (isDesktop) {
    return {
      mode: "pages",
      items: pages.data?.items,
      total: pages.data?.total ?? 0,
      page: pages.data?.page ?? filters.page,
      pageSize: pages.data?.pageSize ?? filters.pageSize,
      isPending: pages.isPending,
      isError: pages.isError,
      error: pages.error,
      refetch: pages.refetch,
      isRefreshing: pages.isPlaceholderData,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: () => undefined,
    };
  }

  const loaded = infinite.data?.pages;
  return {
    mode: "infinite",
    items: loaded?.flatMap((chunk) => chunk.items),
    total: loaded?.[0]?.total ?? 0,
    page: 1,
    pageSize: MOBILE_PAGE_SIZE,
    isPending: infinite.isPending,
    isError: infinite.isError,
    error: infinite.error,
    refetch: infinite.refetch,
    isRefreshing: infinite.isRefetching && !infinite.isFetchingNextPage,
    hasNextPage: infinite.hasNextPage,
    isFetchingNextPage: infinite.isFetchingNextPage,
    fetchNextPage: infinite.fetchNextPage,
  };
}
