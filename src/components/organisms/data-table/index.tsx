import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { cn } from "@/utils/cn";

export type DataTableColumn<Item> = {
  header: string;
  cell: (item: Item) => ReactNode;
  /** Width of the skeleton bar in this column (Tailwind class). */
  skeleton?: string;
  /** Badge-shaped skeleton instead of a text bar. */
  skeletonShape?: "text" | "pill";
  className?: string;
  /** Money/number columns: header and cells aligned right. */
  align?: "right";
};

type DataTableProps<Item> = {
  columns: DataTableColumn<Item>[];
  items: Item[] | undefined;
  rowKey: (item: Item) => string;
  /** Where a row leads; the first cell becomes a real link to it. */
  rowHref: (item: Item) => string;
  isLoading: boolean;
  isRefreshing?: boolean;
  /** Shown when there is nothing to list (same as the card view's). */
  empty: ReactNode;
  loadingLabel: string;
  skeletonRows?: number;
};

/**
 * Table view of a resource list, driven by columns. The whole row opens the
 * item (keeping the list URL to come back to); the first cell is a link, so
 * keyboard and "open in new tab" work too.
 */
export function DataTable<Item>({
  columns,
  items,
  rowKey,
  rowHref,
  isLoading,
  isRefreshing = false,
  empty,
  loadingLabel,
  skeletonRows = 8,
}: DataTableProps<Item>) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = { from: location.pathname + location.search };

  const head = (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {columns.map((column) => (
          <TableHead
            key={column.header}
            className={cn(column.align === "right" && "text-right")}
          >
            {column.header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );

  if (isLoading) {
    return (
      <SkeletonRegion label={loadingLabel}>
        <Table>
          {head}
          <TableBody>
            {Array.from({ length: skeletonRows }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableCell key={column.header}>
                    {column.skeletonShape === "pill" ? (
                      <Skeleton
                        shape="pill"
                        className={cn("h-5", column.skeleton ?? "w-20")}
                      />
                    ) : (
                      <Skeleton
                        shape="text"
                        className={column.skeleton ?? "w-24"}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SkeletonRegion>
    );
  }

  if (!items?.length) return <>{empty}</>;

  return (
    <Table
      aria-busy={isRefreshing}
      className={cn(
        "transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      {head}
      <TableBody>
        {items.map((item) => {
          const href = rowHref(item);
          return (
            <TableRow
              key={rowKey(item)}
              className="cursor-pointer"
              onClick={() => navigate(href, { state: from })}
            >
              {columns.map((column, index) => (
                <TableCell
                  key={column.header}
                  className={cn(
                    column.align === "right" && "text-right tabular-nums",
                    column.className,
                  )}
                >
                  {index === 0 ? (
                    <Link
                      to={href}
                      state={from}
                      onClick={(event) => event.stopPropagation()}
                      className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {column.cell(item)}
                    </Link>
                  ) : (
                    column.cell(item)
                  )}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
