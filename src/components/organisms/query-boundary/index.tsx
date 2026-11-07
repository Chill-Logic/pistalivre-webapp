import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";

type QueryBoundaryProps<T> = {
  query: UseQueryResult<T>;
  skeleton: ReactNode;
  /** Announced to screen readers while loading. */
  label?: string;
  children: (data: T) => ReactNode;
};

/**
 * One independent section of a page: its own skeleton, its own error with
 * retry, so a slow or failing source never blanks the rest of the screen.
 */
export function QueryBoundary<T>({
  query,
  skeleton,
  label,
  children,
}: QueryBoundaryProps<T>) {
  if (query.isPending) {
    return <SkeletonRegion label={label}>{skeleton}</SkeletonRegion>;
  }
  if (query.isError) {
    return <QueryError error={query.error} onRetry={() => query.refetch()} />;
  }
  return <>{children(query.data)}</>;
}
