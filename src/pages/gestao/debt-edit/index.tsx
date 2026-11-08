import { HandCoins } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { DebtForm, DebtFormSkeleton } from "@/components/organisms/debt-form";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useDebt } from "@/hooks/api/gestao/debts/useDebt";

export function DebtEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const debt = useDebt(id);
  const detailUrl = routeTo.debt(id);

  return (
    <Box className="space-y-4">
      <BackLink to={detailUrl} label={debt.data?.lendersLabel ?? "Dívida"} />
      <PageHeader title="Editar dívida" />
      {debt.isPending && (
        <SkeletonRegion label="Carregando dívida…">
          <DebtFormSkeleton />
        </SkeletonRegion>
      )}
      {debt.isError &&
        (isNotFound(debt.error) ? (
          <EmptyState icon={HandCoins} title="Dívida não encontrada" />
        ) : (
          <QueryError error={debt.error} onRetry={() => debt.refetch()} />
        ))}
      {debt.data && (
        <DebtForm
          key={debt.data.id}
          debt={debt.data}
          cancelTo={detailUrl}
          onSaved={() => navigate(detailUrl, { replace: true })}
        />
      )}
    </Box>
  );
}
