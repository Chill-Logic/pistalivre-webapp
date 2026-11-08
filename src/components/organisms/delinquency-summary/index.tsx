import { Col, Row } from "@/components/atoms/grid";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import {
  BarListCard,
  BarListCardSkeleton,
} from "@/components/organisms/bar-list-card";
import { overdueByPurposeItems } from "@/helpers/dashboard";
import { delinquentItems, latePayerItems } from "@/helpers/finance";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Delinquency } from "@/types/dashboard";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

/** Local delinquency (our charges only; overdue by status OR by date). */
export function DelinquencySummary({
  delinquency,
}: {
  delinquency: Delinquency;
}) {
  const { label } = useLabels();
  const { overdue, pending, paid } = delinquency;

  return (
    <Row className="gap-y-6">
      <Col span={6}>
        <StatCard
          label="Vencido em aberto"
          value={formatCurrency(overdue.amount)}
          tone={overdue.amount > 0 ? "destructive" : "default"}
          // "A receber" shows today's due (with fine/interest); this is the
          // original amount — say so, or the two look contradictory.
          hint={`${pluralize(overdue.count, "cobrança", "cobranças")} · valor original, sem multa/juros`}
        />
      </Col>
      <Col span={6}>
        <StatCard
          label="A vencer"
          value={formatCurrency(pending.amount)}
          hint={pluralize(pending.count, "cobrança", "cobranças")}
        />
      </Col>
      {delinquency.overdueRate != null && (
        <Col span={6}>
          <StatCard
            label="Taxa de inadimplência"
            value={`${delinquency.overdueRate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}
            tone={delinquency.overdueRate > 0 ? "destructive" : "default"}
            hint="vencido sobre o total em aberto"
          />
        </Col>
      )}
      <Col span={delinquency.overdueRate != null ? 6 : undefined}>
        <StatCard
          label="Pagas com atraso"
          value={paid.lateCount}
          hint={
            paid.lateCount > 0
              ? `média de ${pluralize(Math.round(paid.avgDaysLate), "dia", "dias")} · de ${paid.count} pagas`
              : `de ${paid.count} pagas`
          }
        />
      </Col>
      <Col>
        <BarListCard
          title="Vencido por finalidade"
          items={overdueByPurposeItems(delinquency, label)}
          empty="Nenhuma cobrança vencida."
        />
      </Col>
      <Col>
        <BarListCard
          title="Inadimplentes agora"
          items={delinquentItems(delinquency)}
          empty="Ninguém em atraso."
        />
      </Col>
      <Col>
        <BarListCard
          title="Top 5 que mais atrasam"
          items={latePayerItems(delinquency)}
          empty="Ninguém com histórico de atraso ainda."
        />
      </Col>
    </Row>
  );
}

export function DelinquencySummarySkeleton() {
  return (
    <Row className="gap-y-6">
      <Col span={6}>
        <StatCardSkeleton />
      </Col>
      <Col span={6}>
        <StatCardSkeleton />
      </Col>
      <Col span={6}>
        <StatCardSkeleton />
      </Col>
      <Col span={6}>
        <StatCardSkeleton />
      </Col>
      <Col>
        <BarListCardSkeleton />
      </Col>
      <Col>
        <BarListCardSkeleton />
      </Col>
      <Col>
        <BarListCardSkeleton />
      </Col>
    </Row>
  );
}
