import { HandCoins } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  DebtBalanceCard,
  DebtBalanceCardSkeleton,
} from "@/components/organisms/debt-balance-card";
import {
  DebtOverview,
  DebtOverviewSkeleton,
} from "@/components/organisms/debt-overview";
import { DebtPaymentDialog } from "@/components/organisms/debt-payment-dialog";
import { DebtPaymentsCard } from "@/components/organisms/debt-payments-card";
import {
  DebtPlanCard,
  DebtPlanCardSkeleton,
} from "@/components/organisms/debt-plan-card";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import { QueryError } from "@/components/organisms/query-error";
import { DebtDetailLayout } from "@/components/templates/debt-detail-layout";
import { ROUTES } from "@/constants/routes";
import { queryKeys } from "@/constants/query-keys";
import { isNotFound } from "@/helpers/api-error";
import { useDebt } from "@/hooks/api/gestao/debts/useDebt";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function DebtDetailPage() {
  const { id = "" } = useParams();
  const debt = useDebt(id);
  const backTo = useBackToList(ROUTES.financeDebts);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Débitos" />
      {debt.isPending && (
        <SkeletonRegion label="Carregando dívida…">
          <DebtDetailLayout
            overview={<DebtOverviewSkeleton />}
            balance={<DebtBalanceCardSkeleton />}
            plan={<DebtPlanCardSkeleton />}
            payments={<DebtPlanCardSkeleton />}
            documents={<DocumentsCardSkeleton />}
          />
        </SkeletonRegion>
      )}
      {debt.isError &&
        (isNotFound(debt.error) ? (
          <EmptyState
            icon={HandCoins}
            title="Dívida não encontrada"
            description="Ela pode ter sido excluída ou o endereço está errado."
          />
        ) : (
          <QueryError error={debt.error} onRetry={() => debt.refetch()} />
        ))}
      {debt.data && (
        <DebtDetailLayout
          overview={<DebtOverview debt={debt.data} />}
          balance={<DebtBalanceCard debt={debt.data} />}
          plan={<DebtPlanCard plan={debt.data.plan} />}
          payments={
            <DebtPaymentsCard
              payments={debt.data.payments}
              debtId={debt.data.id}
              action={<DebtPaymentDialog debt={debt.data} />}
            />
          }
          documents={
            <DocumentsCard
              documents={debt.data.documents}
              manage={{
                owner: { type: "DEBT", id: debt.data.id },
                invalidate: queryKeys.debts.detail(debt.data.id),
              }}
            />
          }
        />
      )}
    </Box>
  );
}
