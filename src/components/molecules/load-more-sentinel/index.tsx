import { useEffect } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { useInView } from "@/hooks/ui/useInView";

type LoadMoreSentinelProps = {
  loaded: number;
  total: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => unknown;
};

/**
 * Foot of an infinite list (phone): loads the next 10 as it scrolls into
 * view; the button is the fallback when the observer can't fire.
 */
export function LoadMoreSentinel({
  loaded,
  total,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: LoadMoreSentinelProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) onLoadMore();
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <Box ref={ref} className="flex flex-col items-center gap-2 py-2">
      {isFetchingNextPage ? (
        <Spinner aria-label="Carregando mais…" />
      ) : hasNextPage ? (
        <Button variant="outline" size="sm" onClick={() => onLoadMore()}>
          Carregar mais
        </Button>
      ) : null}
      {total > 0 && (
        <Text size="xs" tone="muted">
          {loaded} de {total}
        </Text>
      )}
    </Box>
  );
}
