import { Col, Row } from "@/components/atoms/grid";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import {
  formatFleetMonths,
  formatKm,
  formatMeasure,
  kmCoverageHint,
} from "@/helpers/maintenance-analysis";
import type { AnalysisMeasures } from "@/types/maintenance-analysis";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

type MaintenanceRateKpisProps = {
  totals: AnalysisMeasures;
  kmCoverage: { vehicles: number; withKm: number };
};

/** The four rulers of the whole fleet in the period, ready from the server. */
export function MaintenanceRateKpis({
  totals,
  kmCoverage,
}: MaintenanceRateKpisProps) {
  return (
    <Row className="gap-y-4">
      <Col span={6} lg={3}>
        <StatCard
          label="Custo de manutenção"
          value={formatCurrency(totals.cost)}
          hint={pluralize(totals.count, "manutenção", "manutenções")}
        />
      </Col>
      <Col span={6} lg={3}>
        <StatCard
          label="R$ por moto-mês"
          value={formatMeasure(
            totals.costPerVehicleMonth,
            "costPerVehicleMonth",
          )}
          hint={formatFleetMonths(totals.fleetMonths)}
        />
      </Col>
      <Col span={6} lg={3}>
        <StatCard
          label="R$ por km"
          value={formatMeasure(totals.costPerKm, "costPerKm")}
          tone={totals.costPerKm == null ? "muted" : "default"}
          hint={
            totals.km > 0
              ? `${formatKm(totals.km)} · ${kmCoverageHint(kmCoverage)}`
              : kmCoverageHint(kmCoverage)
          }
        />
      </Col>
      <Col span={6} lg={3}>
        <StatCard
          label="% da receita"
          value={formatMeasure(totals.revenueShare, "revenueShare")}
          tone={totals.revenueShare == null ? "muted" : "default"}
          hint={`de ${formatCurrency(totals.revenue)} de aluguel recebido`}
        />
      </Col>
    </Row>
  );
}

export function MaintenanceRateKpisSkeleton() {
  return (
    <Row className="gap-y-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Col key={index} span={6} lg={3}>
          <StatCardSkeleton />
        </Col>
      ))}
    </Row>
  );
}
