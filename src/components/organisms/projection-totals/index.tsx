import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { Text } from "@/components/atoms/text";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import type { ProjectionSeed, ProjectionTotals } from "@/types/projection";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

type ProjectionTotalsCardProps = {
  totals: ProjectionTotals;
  worstVehicle: ProjectionSeed["worstVehicle"];
  /** A newer scenario is being computed: dim the old numbers. */
  isStale: boolean;
};

/** Revenue, costs and profit for the horizon, plus where costs come from. */
export function ProjectionTotalsCard({
  totals,
  worstVehicle,
  isStale,
}: ProjectionTotalsCardProps) {
  const margin =
    totals.revenue > 0
      ? `${Math.round((totals.profit / totals.revenue) * 100)}% do faturamento`
      : "Sem faturamento no cenário";

  return (
    <Box
      aria-busy={isStale}
      className={cn(
        "space-y-3 transition-opacity duration-200",
        isStale && "opacity-60",
      )}
    >
      <Row className="gap-y-4">
        <Col md={4}>
          <StatCard
            label={`Faturamento em ${totals.months} meses (aluguel)`}
            value={formatCurrency(totals.revenue)}
            tone="primary"
          />
        </Col>
        <Col span={6} md={4}>
          <StatCard label="Despesas totais" value={formatCurrency(totals.costs)} />
        </Col>
        <Col span={6} md={4}>
          <StatCard
            label="Lucro projetado"
            value={formatCurrency(totals.profit)}
            tone={totals.profit < 0 ? "destructive" : "success"}
            hint={margin}
          />
        </Col>
      </Row>
      <Text size="xs" tone="muted">
        Despesas: manutenção {formatCurrency(totals.maintenance)} · custos fixos{" "}
        {formatCurrency(totals.suppliers)} · financiamento{" "}
        {formatCurrency(totals.financing)} · empresa{" "}
        {formatCurrency(totals.company)}.
        {worstVehicle &&
          ` Manutenção base: ${worstVehicle.plate} gastou ${formatCurrency(worstVehicle.totalCost)} em ${worstVehicle.months} ${worstVehicle.months === 1 ? "mês" : "meses"} (pior caso, conservador).`}{" "}
        Receita contratada, não realizada; moto parada não gera manutenção, só
        custos fixos. Aluguel semanal conta 4 semanas por mês (conservador: o
        ano real tem 52 semanas, cerca de 4,33 por mês).
      </Text>
    </Box>
  );
}

export function ProjectionTotalsSkeleton() {
  return (
    <Row className="gap-y-4">
      {[12, 6, 6].map((span, index) => (
        <Col key={index} span={span as 6 | 12} md={4}>
          <StatCardSkeleton />
        </Col>
      ))}
    </Row>
  );
}
