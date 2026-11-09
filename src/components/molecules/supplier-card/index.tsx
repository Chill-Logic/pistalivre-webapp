import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { useLabels } from "@/hooks/ui/useLabels";
import type { SupplierListRow } from "@/types/supplier";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

export function SupplierCard({ supplier }: { supplier: SupplierListRow }) {
  const location = useLocation();
  const { label } = useLabels();
  const details = [
    label(LABEL_MAPS.supplierScope, supplier.scope),
    supplier.scope === "VEHICLE" &&
      pluralize(supplier.vehicleCount, "veículo", "veículos"),
  ].filter(Boolean);

  return (
    <Link
      to={routeTo.supplier(supplier.id)}
      state={{ from: location.pathname + location.search }}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Text size="base" weight="semibold" className="min-w-0 break-words">
              {supplier.name}
            </Text>
            {!supplier.active && <Badge variant="outline">Inativo</Badge>}
          </Box>
          <Text size="xs" tone="muted">
            {details.join(" · ")}
          </Text>
          <Text weight="medium" className="tabular-nums">
            {formatCurrency(supplier.currentMonthly)}
            <Text inline size="xs" tone="muted" weight="normal">
              {" "}
              / mês
            </Text>
          </Text>
        </Box>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Card>
    </Link>
  );
}

export function SupplierCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Skeleton shape="text" className="w-1/2 text-base" />
        <Skeleton shape="text" className="w-28 text-xs" />
        <Skeleton shape="text" className="w-32 text-sm" />
      </Box>
      <Skeleton className="size-4 shrink-0" />
    </Card>
  );
}
