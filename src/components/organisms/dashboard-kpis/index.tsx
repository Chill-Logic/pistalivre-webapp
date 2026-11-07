import { Col, Row } from "@/components/atoms/grid";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import { LABEL_MAPS } from "@/constants/label-maps";
import {
  balanceHint,
  consolidatedBalance,
  funnelStages,
  openLeadCount,
} from "@/helpers/dashboard";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Dashboard } from "@/types/dashboard";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

export function DashboardKpis({ dashboard }: { dashboard: Dashboard }) {
  const { map } = useLabels();
  const { analytics, delinquency, balances, funnel } = dashboard;
  const balance = consolidatedBalance(balances);
  const stages = funnelStages(map(LABEL_MAPS.leadStatus));

  return (
    <Row className="gap-y-4">
      <Col md={4} lg={4}>
        <StatCard
          label="Saldo consolidado"
          value={balance == null ? "Indisponível" : formatCurrency(balance)}
          tone={balance == null ? "muted" : "default"}
          hint={balance == null ? undefined : balanceHint(balances)}
        />
      </Col>
      <Col span={6} md={4} lg={2}>
        <StatCard
          label="Vencido em aberto"
          value={formatCurrency(delinquency.overdue.amount)}
          tone={delinquency.overdue.amount > 0 ? "destructive" : "default"}
          hint={pluralize(delinquency.overdue.count, "cobrança", "cobranças")}
        />
      </Col>
      <Col span={6} md={4} lg={2}>
        <StatCard label="Locações ativas" value={analytics.activeRentals} />
      </Col>
      <Col span={6} md={6} lg={2}>
        <StatCard
          label="Frota"
          value={analytics.fleet.total}
          hint={pluralize(
            analytics.fleet.available,
            "disponível",
            "disponíveis",
          )}
        />
      </Col>
      <Col span={6} md={6} lg={2}>
        <StatCard
          label="Leads no funil"
          value={openLeadCount(funnel.byStatus, stages)}
        />
      </Col>
    </Row>
  );
}

export function DashboardKpisSkeleton() {
  return (
    <Row className="gap-y-4">
      <Col md={4} lg={4}>
        <StatCardSkeleton />
      </Col>
      <Col span={6} md={4} lg={2}>
        <StatCardSkeleton />
      </Col>
      <Col span={6} md={4} lg={2}>
        <StatCardSkeleton />
      </Col>
      <Col span={6} md={6} lg={2}>
        <StatCardSkeleton />
      </Col>
      <Col span={6} md={6} lg={2}>
        <StatCardSkeleton />
      </Col>
    </Row>
  );
}
