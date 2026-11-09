import { Col, Row } from "@/components/atoms/grid";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import type { MonthTotals } from "@/types/expense";
import { formatCurrency } from "@/utils/format";

/** The month at a glance: how much it weighs, what's paid, what's open. */
export function ExpenseMonthSummary({ totals }: { totals: MonthTotals }) {
  return (
    <Row className="gap-y-4">
      <Col md={4}>
        <StatCard label="Total do mês" value={formatCurrency(totals.expected)} />
      </Col>
      <Col span={6} md={4}>
        <StatCard
          label="Pago"
          value={formatCurrency(totals.paid)}
          tone={totals.paid > 0 ? "success" : "default"}
        />
      </Col>
      <Col span={6} md={4}>
        <StatCard label="Em aberto" value={formatCurrency(totals.open)} />
      </Col>
    </Row>
  );
}

export function ExpenseMonthSummarySkeleton() {
  return (
    <Row className="gap-y-4">
      <Col md={4}>
        <StatCardSkeleton />
      </Col>
      <Col span={6} md={4}>
        <StatCardSkeleton />
      </Col>
      <Col span={6} md={4}>
        <StatCardSkeleton />
      </Col>
    </Row>
  );
}
