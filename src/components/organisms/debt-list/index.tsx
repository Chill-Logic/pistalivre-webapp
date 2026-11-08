import { HandCoins } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { DebtCard, DebtCardSkeleton } from "@/components/molecules/debt-card";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { DebtRowPayment } from "@/components/organisms/debt-row-payment";
import type { DebtListItem } from "@/types/debt";
import { cn } from "@/utils/cn";

const SKELETON_ROWS = 4;

type DebtListProps = {
  debts: DebtListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

export function DebtList({
  debts,
  isLoading,
  isRefreshing = false,
}: DebtListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando débitos…">
        <DebtListSkeleton />
      </SkeletonRegion>
    );
  }

  if (!debts?.length) return <DebtsEmpty />;

  return (
    <Row
      as="ul"
      aria-busy={isRefreshing}
      className={cn(
        "gap-y-6 transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      {debts.map((debt) => (
        <Col as="li" key={debt.id} md={6} xl={4}>
          <DebtCard
            debt={debt}
            footer={!debt.balance.settled && <DebtRowPayment debt={debt} />}
          />
        </Col>
      ))}
    </Row>
  );
}

export function DebtsEmpty() {
  return (
    <EmptyState
      icon={HandCoins}
      title="Nenhuma dívida registrada"
      description="Empréstimos e financiamentos da empresa aparecem aqui."
    />
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
