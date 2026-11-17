import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { ANALYSIS_GROUP_HEADER } from "@/constants/maintenance-analysis";
import {
  formatFleetMonths,
  formatKm,
  formatMeasure,
} from "@/helpers/maintenance-analysis";
import type {
  AnalysisDimension,
  AnalysisRow,
  AnalysisSort,
} from "@/types/maintenance-analysis";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

type MaintenanceAnalysisTableProps = {
  dimension: AnalysisDimension;
  rows: AnalysisRow[];
  sort: AnalysisSort;
  /** Type, service…: every row has the fleet's denominator (no sub-lines). */
  fleetWide: boolean;
  isRefreshing: boolean;
  onOpen: (row: AnalysisRow) => void;
};

type Column = {
  measure: Exclude<AnalysisSort, "natural">;
  header: string;
  /** The denominator under the number (hidden when it is the fleet's). */
  sub?: (row: AnalysisRow) => string;
};

const COLUMNS: Column[] = [
  { measure: "count", header: "Manutenções" },
  { measure: "cost", header: "Custo" },
  {
    measure: "costPerVehicleMonth",
    header: "R$ por moto-mês",
    sub: (row) => formatFleetMonths(row.fleetMonths),
  },
  {
    measure: "costPerKm",
    header: "R$ por km",
    sub: (row) => (row.km > 0 ? formatKm(row.km) : "sem km medido"),
  },
  {
    measure: "revenueShare",
    header: "% da receita",
    sub: (row) =>
      row.revenue > 0 ? `de ${formatCurrency(row.revenue)}` : "sem receita",
  },
];

/**
 * The analysis, one line per group: a dense table on the desktop and cards on
 * the phone. The chosen measure stands out; a line opens its maintenances.
 */
export function MaintenanceAnalysisTable({
  dimension,
  rows,
  sort,
  fleetWide,
  isRefreshing,
  onOpen,
}: MaintenanceAnalysisTableProps) {
  const highlighted = sort === "natural" ? "cost" : sort;
  const fade = cn(
    "transition-opacity duration-200",
    isRefreshing && "pointer-events-none opacity-60",
  );

  return (
    <>
      <Box className={cn("hidden md:block", fade)} aria-busy={isRefreshing}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{ANALYSIS_GROUP_HEADER[dimension]}</TableHead>
              {COLUMNS.map((column) => (
                <TableHead
                  key={column.measure}
                  className={cn(
                    "text-right",
                    column.measure === highlighted && "text-foreground",
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.key}
                className="cursor-pointer"
                onClick={() => onOpen(row)}
              >
                <TableCell className="max-w-72 whitespace-normal">
                  <Button
                    variant="link"
                    className="block h-auto max-w-full truncate p-0 text-left font-medium text-foreground md:h-auto"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen(row);
                    }}
                  >
                    {row.label}
                  </Button>
                  {row.detail && (
                    <Text size="xs" tone="muted" truncate>
                      {row.detail}
                    </Text>
                  )}
                </TableCell>
                {COLUMNS.map((column) => (
                  <TableCell
                    key={column.measure}
                    className="text-right tabular-nums"
                  >
                    <Text
                      weight={
                        column.measure === highlighted ? "bold" : "medium"
                      }
                    >
                      {formatMeasure(row[column.measure], column.measure)}
                    </Text>
                    {column.sub && !fleetWide && (
                      <Text size="xs" tone="muted">
                        {column.sub(row)}
                      </Text>
                    )}
                    {column.measure === "count" && row.withoutCost > 0 && (
                      <Text size="xs" tone="muted">
                        {pluralize(row.withoutCost, "sem valor", "sem valor")}
                      </Text>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <List
        className={cn("space-y-2 md:hidden", fade)}
        aria-busy={isRefreshing}
      >
        {rows.map((row) => (
          <ListItem key={row.key}>
            <Button
              variant="outline"
              className="h-auto w-full flex-col items-stretch gap-2 whitespace-normal bg-card p-3 text-left font-normal"
              onClick={() => onOpen(row)}
            >
              <Text inline className="flex items-start justify-between gap-3">
                <Text inline className="min-w-0">
                  <Text inline weight="medium" className="block truncate">
                    {row.label}
                  </Text>
                  {row.detail && (
                    <Text
                      inline
                      size="xs"
                      tone="muted"
                      className="block truncate"
                    >
                      {row.detail}
                    </Text>
                  )}
                </Text>
                <Text inline weight="bold" className="shrink-0 tabular-nums">
                  {formatMeasure(row[highlighted], highlighted)}
                </Text>
              </Text>
              <Text
                inline
                size="xs"
                tone="muted"
                className="flex flex-wrap gap-x-3 gap-y-1 tabular-nums"
              >
                {COLUMNS.filter((column) => column.measure !== highlighted).map(
                  (column) => (
                    <Text inline key={column.measure}>
                      {column.header}:{" "}
                      {formatMeasure(row[column.measure], column.measure)}
                    </Text>
                  ),
                )}
              </Text>
            </Button>
          </ListItem>
        ))}
      </List>
    </>
  );
}

export function MaintenanceAnalysisTableSkeleton() {
  return (
    <SkeletonRegion label="Carregando a análise…">
      <Box className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <Skeleton shape="text" className="w-16 text-xs" />
              </TableHead>
              {COLUMNS.map((column) => (
                <TableHead key={column.measure} className="text-right">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell>
                  <Skeleton shape="text" className="w-32" />
                  <Skeleton shape="text" className="w-20 text-xs" />
                </TableCell>
                {COLUMNS.map((column) => (
                  <TableCell key={column.measure} className="text-right">
                    <Skeleton shape="text" className="ml-auto w-16" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box className="space-y-2 md:hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <Box key={index} className="space-y-2 rounded-md border bg-card p-3">
            <Box className="flex justify-between gap-3">
              <Skeleton shape="text" className="w-32" />
              <Skeleton shape="text" className="w-16" />
            </Box>
            <Skeleton shape="text" className="w-full text-xs" />
          </Box>
        ))}
      </Box>
    </SkeletonRegion>
  );
}
