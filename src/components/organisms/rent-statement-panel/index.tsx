import { CalendarX } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
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
  statementPeriodFromParams,
} from "@/helpers/rent-statement";
import {
  useRentStatement,
  useRentStatementPdf,
} from "@/hooks/api/comum/rent-statement/useRentStatement";
import type { RentStatementScope } from "@/services/api/comum/rent-statement.service";
import { formatCalendarDate } from "@/utils/format";

/**
 * The statement of a rental, for the staff or the renter: the model lives
 * in the URL (`?modelo=saldo|dia`) like tabs, the PDF is the same model.
 * `?de=&ate=` narrows it to a period (the rent reconciliation's), screen
 * and PDF alike.
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
  const period = statementPeriodFromParams(searchParams);
  const params = { mode, ...period };
  const statement = useRentStatement(scope, rentalId, params);
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
  const hasPeriod = Boolean(period.from || period.through);
  return (
    <>
      {hasPeriod && (
        <Box className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2">
          <Text size="sm">
            Período{" "}
            {period.from
              ? `de ${formatCalendarDate(period.from)}`
              : "desde o início"}{" "}
            {period.through
              ? `a ${formatCalendarDate(period.through)}`
              : "até hoje"}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setSearchParams(
                (current) => {
                  current.delete("de");
                  current.delete("ate");
                  return current;
                },
                { replace: true },
              )
            }
          >
            Período todo
          </Button>
        </Box>
      )}
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
        onPdf={() => pdf.mutate(params)}
        isPdfPending={pdf.isPending}
      />
    </>
  );
}
