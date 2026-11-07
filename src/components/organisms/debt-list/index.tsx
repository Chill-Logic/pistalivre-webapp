import { HandCoins } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { DebtCard, DebtCardSkeleton } from "@/components/molecules/debt-card";
import { EmptyState } from "@/components/molecules/empty-state";
import type { DebtListItem } from "@/types/debt";

const SKELETON_ROWS = 4;

export function DebtList({ debts }: { debts: DebtListItem[] }) {
  if (debts.length === 0) {
    return (
      <EmptyState
        icon={HandCoins}
        title="Nenhuma dívida registrada"
        description="Empréstimos e financiamentos da empresa aparecem aqui."
      />
    );
  }

  return (
    <Row as="ul" className="gap-y-6">
      {debts.map((debt) => (
        <Col as="li" key={debt.id} md={6} xl={4}>
          <DebtCard debt={debt} />
        </Col>
      ))}
    </Row>
  );
}

export function DebtListSkeleton() {
  return (
    <Row as="ul" className="gap-y-6">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Col as="li" key={index} md={6} xl={4}>
          <DebtCardSkeleton />
        </Col>
      ))}
    </Row>
  );
}
