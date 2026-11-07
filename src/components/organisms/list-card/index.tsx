import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";

type ListCardProps = {
  title: string;
  /** Shown instead of the rows when there are none. */
  empty: string;
  isEmpty: boolean;
  /** Under the rows (e.g. "and 3 more on the rental page"). */
  footer?: ReactNode;
  children: ReactNode;
};

/** Titled card with divided rows: charges, invoices, keys, requests… */
export function ListCard({
  title,
  empty,
  isEmpty,
  footer,
  children,
}: ListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isEmpty ? (
          <Text tone="muted">{empty}</Text>
        ) : (
          <Box className="divide-y">{children}</Box>
        )}
        {footer && (
          <Text size="xs" tone="muted">
            {footer}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

type ListCardSkeletonProps = {
  rows?: number;
  /** One row in the shape of the real one. */
  row: ReactNode;
};

export function ListCardSkeleton({ rows = 2, row }: ListCardSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-32 text-base" />
      </CardHeader>
      <CardContent>
        <Box className="divide-y">
          {Array.from({ length: rows }, (_, index) => (
            <Box key={index}>{row}</Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

/** Generic row placeholder: title + meta on the left, value + badge right. */
export function ListRowSkeleton() {
  return (
    <Box className="flex items-start justify-between gap-3 py-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Skeleton shape="text" className="w-32 text-sm" />
        <Skeleton shape="text" className="w-48 text-xs" />
      </Box>
      <Box className="flex shrink-0 flex-col items-end gap-2">
        <Skeleton shape="text" className="w-20 text-base" />
        <Skeleton shape="pill" className="h-5 w-16" />
      </Box>
    </Box>
  );
}
