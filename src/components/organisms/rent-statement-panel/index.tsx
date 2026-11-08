import { CalendarX } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import {
  RentStatementView,
  RentStatementViewSkeleton,
} from "@/components/organisms/rent-statement-view";
import { isNotFound } from "@/helpers/api-error";
import {
  statementModeFromParam,
  statementModeSlug,
} from "@/helpers/rent-statement";
import {
  useRentStatement,
  useRentStatementPdf,
} from "@/hooks/api/comum/rent-statement/useRentStatement";
import type { RentStatementScope } from "@/services/api/comum/rent-statement.service";

/**
 * The statement of a rental, for the staff or the renter: the model lives
 * in the URL (`?modelo=saldo|dia`) like tabs, the PDF is the same model.
 */
export function RentStatementPanel({
  scope,
  rentalId,
}: {
  scope: RentStatementScope;
  rentalId: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = statementModeFromParam(searchParams.get("modelo"));
  const statement = useRentStatement(scope, rentalId, { mode });
  const pdf = useRentStatementPdf(scope, rentalId);

  if (statement.isPending) {
    return (
      <SkeletonRegion label="Carregando extrato…">
        <RentStatementViewSkeleton />
      </SkeletonRegion>
    );
  }
  if (statement.isError) {
    return isNotFound(statement.error) ? (
      <EmptyState icon={CalendarX} title="Locação não encontrada" />
    ) : (
      <QueryError error={statement.error} onRetry={() => statement.refetch()} />
    );
  }
  if (!statement.data.available) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Ainda sem extrato"
        description={statement.data.message}
      />
    );
  }
  return (
    <>
      <RentStatementView
        report={statement.data}
        isRefreshing={statement.isPlaceholderData}
        onModeChange={(next) =>
          setSearchParams(
            (current) => {
              current.set("modelo", statementModeSlug(next));
              return current;
            },
            { replace: true },
          )
        }
        onPdf={() => pdf.mutate({ mode })}
        isPdfPending={pdf.isPending}
      />
    </>
  );
}
