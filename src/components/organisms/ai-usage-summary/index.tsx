import { Col, Row } from "@/components/atoms/grid";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import type { AiUsageTotals } from "@/types/ai-usage";
import { formatInteger, formatUsd } from "@/utils/format";

/** The month's AI bill at a glance (USD, as the providers charge). */
export function AiUsageSummary({ totals }: { totals: AiUsageTotals }) {
  const cache = totals.cacheReadTokens + totals.cacheCreationTokens;
  return (
    <Row className="gap-y-4">
      <Col md={6} lg={3}>
        <StatCard label="Custo do mês" value={formatUsd(totals.costUsd)} tone="primary" />
      </Col>
      <Col span={6} lg={3}>
        <StatCard label="Chamadas" value={formatInteger(totals.calls)} />
      </Col>
      <Col span={6} lg={3}>
        <StatCard
          label="Tokens de entrada"
          value={formatInteger(totals.inputTokens)}
          hint={cache > 0 ? `+ ${formatInteger(cache)} de cache` : undefined}
        />
      </Col>
      <Col md={6} lg={3}>
        <StatCard label="Tokens de saída" value={formatInteger(totals.outputTokens)} />
      </Col>
    </Row>
  );
}

export function AiUsageSummarySkeleton() {
  return (
    <Row className="gap-y-4">
      {([6, 6, 6, 6] as const).map((md, index) => (
        <Col key={index} span={index === 1 || index === 2 ? 6 : 12} md={md} lg={3}>
          <StatCardSkeleton />
        </Col>
      ))}
    </Row>
  );
}
