import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import {
  MaintenanceRateKpis,
  MaintenanceRateKpisSkeleton,
} from "@/components/organisms/maintenance-rate-kpis";
import { ROUTES } from "@/constants/routes";
import type { MaintenanceRate } from "@/types/maintenance-analysis";

/** Painel: the maintenance rate of the last 12 months + the way to the analysis. */
export function MaintenanceRateCard({ rate }: { rate: MaintenanceRate }) {
  return (
    <Box className="space-y-3">
      <Box className="flex items-center justify-between gap-3">
        <Box className="min-w-0">
          <Heading level={2} variant="section">
            Taxa de manutenção
          </Heading>
          <Text size="xs" tone="muted">
            Últimos 12 meses
          </Text>
        </Box>
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.maintenanceAnalysis}>
            Ver análise
            <ChevronRight />
          </Link>
        </Button>
      </Box>
      <MaintenanceRateKpis totals={rate.totals} kmCoverage={rate.kmCoverage} />
    </Box>
  );
}

export function MaintenanceRateCardSkeleton() {
  return (
    <Box className="space-y-3">
      <Box className="flex items-center justify-between gap-3">
        <Box className="space-y-1">
          <Skeleton shape="text" className="w-40 text-base" />
          <Skeleton shape="text" className="w-24 text-xs" />
        </Box>
        <Skeleton className="h-8 w-28" />
      </Box>
      <MaintenanceRateKpisSkeleton />
    </Box>
  );
}
