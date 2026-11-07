import { Col, Row } from "@/components/atoms/grid";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import type { DebtsSummary as Summary } from "@/types/debt";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

/** How much the company owes — the mirror of delinquency. */
export function DebtsSummary({ summary }: { summary: Summary }) {
  return (
    <Row className="gap-y-4">
      <Col md={6} lg={3}>
        <StatCard
          label="Falta pagar"
          value={formatCurrency(summary.outstanding)}
          hint={pluralize(
            summary.openCount,
            "dívida em aberto",
            "dívidas em aberto",
          )}
        />
      </Col>
      <Col span={6} lg={3}>
        <StatCard
          label="Atrasado"
          value={formatCurrency(summary.overdueAmount)}
          tone={summary.overdueAmount > 0 ? "destructive" : "default"}
          hint={pluralize(summary.overdueCount, "dívida", "dívidas")}
        />
      </Col>
      <Col span={6} lg={3}>
        <StatCard
          label="Já pago"
          value={formatCurrency(summary.paid)}
          hint={`de ${formatCurrency(summary.total)}`}
        />
      </Col>
      <Col lg={3}>
        <StatCard
          label="Emprestado"
          value={formatCurrency(summary.borrowed)}
          hint={
            summary.interest > 0
              ? `+ ${formatCurrency(summary.interest)} de juros`
              : "sem juros"
          }
        />
      </Col>
    </Row>
  );
}

export function DebtsSummarySkeleton() {
  return (
    <Row className="gap-y-4">
      <Col md={6} lg={3}>
        <StatCardSkeleton />
      </Col>
      <Col span={6} lg={3}>
        <StatCardSkeleton />
      </Col>
      <Col span={6} lg={3}>
        <StatCardSkeleton />
      </Col>
      <Col lg={3} className="hidden lg:block">
        <StatCardSkeleton />
      </Col>
    </Row>
  );
}
