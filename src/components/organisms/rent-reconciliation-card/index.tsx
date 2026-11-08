import { CalendarRange } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { DateRangeField } from "@/components/molecules/date-range-field";
import { StatCard } from "@/components/molecules/stat-card";
import { QueryError } from "@/components/organisms/query-error";
import { ReconcileFromDialog } from "@/components/organisms/reconcile-from-dialog";
import { RentCreditsDialog } from "@/components/organisms/rent-credits-dialog";
import { WaivedDaysDialog } from "@/components/organisms/waived-days-dialog";
import { currentCycleName, cyclesLabel } from "@/helpers/billing";
import { rentalStatementHref } from "@/helpers/rent-statement";
import { useRentalBilling } from "@/hooks/api/gestao/rentals/useRentalBilling";
import type { BillingPeriod } from "@/types/billing";
import { calendarDay } from "@/utils/date";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

/**
 * Rent reconciliation, as the server computes it (management's
 * `reconcileRent`): what was due (cycles × the value of each day) against
 * what was paid; the difference is what matters. Out of it: waived days,
 * days that do not charge, and the cycle still running.
 */
export function RentReconciliationCard({ rentalId }: { rentalId: string }) {
  const [period, setPeriod] = useState<BillingPeriod | null>(null);
  const billing = useRentalBilling(rentalId, period);
  const whole = useRentalBilling(rentalId);

  if (billing.isPending || whole.isPending)
    return <RentReconciliationCardSkeleton />;
  if (billing.isError) {
    return (
      <QueryError error={billing.error} onRetry={() => billing.refetch()} />
    );
  }

  const view = billing.data;
  const rules = whole.data ?? view;
  const r = view.reconciliation;
  if (!r) return null;

  const units = cyclesLabel(r);
  const settled = Math.abs(r.balance) < 0.01;
  const skipped = [
    r.skippedWeekdays ? `${r.skippedWeekdays} dia(s) que não cobram` : null,
    r.waivedDays ? `${r.waivedDays} abonado(s)` : null,
  ].filter(Boolean);

  return (
    <CollapsibleCard
      title="Acerto do aluguel"
      storageKey="rental-reconciliation"
      contentClassName="space-y-4"
      actions={
        <>
          <ReconcileFromDialog
            rentalId={rentalId}
            reconcileFrom={rules.reconcileFrom}
          />
          {rules.ratePeriod === "DAILY" && (
            <WaivedDaysDialog rentalId={rentalId} days={rules.waivedDays} />
          )}
          <RentCreditsDialog rentalId={rentalId} credits={rules.rentCredits} />
        </>
      }
    >
      <Box
        aria-busy={billing.isFetching}
        className={cn(
          "space-y-4 transition-opacity duration-200",
          billing.isFetching && billing.isPlaceholderData && "opacity-60",
        )}
      >
        <Text size="sm" tone="muted">
          De {formatCalendarDate(r.from)}
          {!r.filtered && !r.fromIsManual && " (1ª cobrança)"} a{" "}
          {formatCalendarDate(r.through)}:{" "}
          <Text inline size="sm" weight="semibold" tone="foreground">
            {units}
          </Text>
          {r.mixedRates
            ? " (cada dia com o valor que valia nele)"
            : ` × ${formatCurrency(r.rate)}`}
          {skipped.length > 0 && ` (fora ${skipped.join(" e ")})`}. Só ciclos já
          vencidos.
        </Text>
        <Box className="flex flex-wrap items-end gap-2">
          <Box className="w-full sm:w-72">
            <DateRangeField
              label="Período"
              start={period?.from ?? calendarDay(r.from)}
              end={period?.through ?? calendarDay(r.through)}
              max={view.today}
              onChange={({ start, end }) =>
                setPeriod({ from: start, through: end })
              }
            />
          </Box>
          {period && (
            <Button variant="ghost" size="sm" onClick={() => setPeriod(null)}>
              Período todo
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link
              to={rentalStatementHref(
                rentalId,
                r.filtered
                  ? { from: calendarDay(r.from), through: calendarDay(r.through) }
                  : null,
              )}
            >
              <CalendarRange />
              Extrato
            </Link>
          </Button>
        </Box>
        <Row className="gap-y-3">
          <Col sm={4}>
            <StatCard
              label="Devido"
              value={formatCurrency(r.expected)}
              hint={units}
            />
          </Col>
          <Col sm={4}>
            <StatCard
              label="Pago"
              value={formatCurrency(r.paid)}
              hint={
                r.credits > 0
                  ? `${r.paidCount} pagamento(s) + ${formatCurrency(r.credits)} em desconto`
                  : `${r.paidCount} pagamento(s)`
              }
            />
          </Col>
          <Col sm={4}>
            <StatCard
              label={
                settled
                  ? "Em dia"
                  : r.balance > 0
                    ? "Falta pagar"
                    : "Pago a mais"
              }
              value={formatCurrency(Math.abs(r.balance))}
              hint={
                r.credits > 0 ? "Devido − pago − descontos" : "Devido − pago"
              }
              tone={
                settled ? "default" : r.balance > 0 ? "destructive" : "success"
              }
            />
          </Col>
        </Row>
        {r.current && (
          <Text size="sm" tone="muted">
            {currentCycleName(r.current.period)} em curso:{" "}
            {formatCurrency(r.current.accrued)} corridos de{" "}
            {formatCurrency(r.current.amount)} · vence{" "}
            {formatCalendarDate(r.current.due)} (fora do saldo)
          </Text>
        )}
        {view.debtPart > 0 && (
          <Text size="sm">
            Do pago: aluguel {formatCurrency(r.paid - view.debtPart)} · débito
            do cliente {formatCurrency(view.debtPart)}
          </Text>
        )}
        {view.paidThrough && (
          <Text size="sm">
            Aluguel pago até{" "}
            <Text inline size="sm" weight="semibold">
              {formatCalendarDate(view.paidThrough)}
            </Text>
          </Text>
        )}
        <Text size="xs" tone="muted">
          Cobrado no período: {formatCurrency(r.charged)} em {r.chargedCount}{" "}
          cobrança(s)
          {r.openCount > 0 &&
            ` · ${r.openCount} em aberto (${formatCurrency(r.open)})`}
          . O pagamento abate o aluguel em aberto mais antigo; o que passar de
          uma cobrança é adiantamento, exceto multa/juros de semanal ou mensal
          pago atrasado, que fica fora.
        </Text>
      </Box>
    </CollapsibleCard>
  );
}

export function RentReconciliationCardSkeleton() {
  return (
    <Box className="space-y-4 rounded-lg border bg-card p-4 shadow-sm md:p-6">
      <Box className="flex items-center justify-between gap-2">
        <Skeleton shape="text" className="w-40 text-base" />
        <Skeleton className="h-9 w-36" />
      </Box>
      <Skeleton shape="text" className="w-3/4 text-sm" />
      <Row className="gap-y-3">
        {[0, 1, 2].map((index) => (
          <Col key={index} sm={4}>
            <Skeleton className="h-24 w-full" />
          </Col>
        ))}
      </Row>
    </Box>
  );
}
