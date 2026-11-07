import { Col, Row } from "@/components/atoms/grid";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import { balanceHint, consolidatedBalance } from "@/helpers/dashboard";
import type { Balances } from "@/types/dashboard";
import { formatCurrency } from "@/utils/format";

/** `null` is "Indisponível" — a source that is down never shows R$ 0,00. */
function balanceValue(value: number | null) {
  return value == null ? "Indisponível" : formatCurrency(value);
}

export function FinanceBalances({ balances }: { balances: Balances }) {
  const consolidated = consolidatedBalance(balances);

  return (
    <Row className="gap-y-4">
      <Col md={4}>
        <StatCard
          label="Saldo consolidado"
          value={balanceValue(consolidated)}
          tone={consolidated == null ? "muted" : "default"}
          hint={consolidated == null ? undefined : balanceHint(balances)}
        />
      </Col>
      <Col span={6} md={4}>
        <StatCard
          label="Asaas"
          value={balanceValue(balances.asaas)}
          tone={balances.asaas == null ? "muted" : "default"}
        />
      </Col>
      <Col span={6} md={4}>
        <StatCard
          label="Banco"
          value={balanceValue(balances.bank)}
          tone={balances.bank == null ? "muted" : "default"}
        />
      </Col>
    </Row>
  );
}

export function FinanceBalancesSkeleton() {
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
