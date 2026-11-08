import { Download } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Meter } from "@/components/atoms/meter";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import { StatementModeToggle } from "@/components/molecules/statement-mode-toggle";
import { StatementMonthCalendar } from "@/components/molecules/statement-month-calendar";
import {
  STATEMENT_CYCLE_BADGE,
  STATEMENT_DAY_CLASS,
  STATEMENT_DAY_MARK,
  STATEMENT_LEGEND,
  STATEMENT_MODES,
} from "@/constants/rent-statement";
import { statementMonths } from "@/helpers/rent-statement";
import type {
  RentStatementMode,
  RentStatementReport,
} from "@/types/rent-statement";
import { cn } from "@/utils/cn";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type RentStatementViewProps = {
  report: RentStatementReport;
  onModeChange: (mode: RentStatementMode) => void;
  onPdf: () => void;
  isPdfPending: boolean;
  /** Another model is loading: the current one fades. */
  isRefreshing?: boolean;
};

/**
 * The rent statement ON SCREEN (management and portal): the same model as
 * the PDF, so what you see is what you export. Every money text of the
 * cycles comes ready from the server (`labels`).
 */
export function RentStatementView({
  report,
  onModeChange,
  onPdf,
  isPdfPending,
  isRefreshing = false,
}: RentStatementViewProps) {
  const { statement, labels } = report;
  const owes = statement.balance > 0;
  const months = statementMonths(statement.days);
  const legend = STATEMENT_LEGEND.filter(([state]) =>
    statement.days.some((day) => day.state === state),
  );
  const active =
    STATEMENT_MODES.find((item) => item.mode === statement.mode) ??
    STATEMENT_MODES[0];

  return (
    <Box
      aria-busy={isRefreshing}
      className={cn(
        "space-y-4 transition-opacity duration-200",
        isRefreshing && "opacity-60",
      )}
    >
      <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatementModeToggle mode={statement.mode} onChange={onModeChange} />
        <Button
          variant="outline"
          size="sm"
          onClick={onPdf}
          disabled={isPdfPending}
          className="w-full sm:w-auto"
        >
          {isPdfPending ? <Spinner /> : <Download />}
          Exportar PDF
        </Button>
      </Box>
      <Text tone="muted">{active.hint}</Text>
      {report.termination && (
        // The reasons come only in the staff statement.
        <Alert variant="warning">
          Rescindida em {report.termination.dateLabel}
          {report.termination.reasons && ` · ${report.termination.reasons}`}
        </Alert>
      )}

      <Box
        className={cn(
          "rounded-lg p-4",
          owes
            ? "bg-error text-error-foreground"
            : "bg-success text-success-foreground",
        )}
      >
        {owes ? (
          <>
            <Text size="xs" weight="bold" className="tracking-wide">
              FALTA PAGAR
            </Text>
            <Text size={null} weight="bold" className="text-3xl">
              {formatCurrency(statement.balance)}
            </Text>
            {statement.openFrom && (
              <Text>
                {statement.mode === "BY_DAY"
                  ? `${statement.openDays} ${statement.openDays === 1 ? "dia" : "dias"} sem pagamento completo`
                  : `Em aberto desde ${formatCalendarDate(statement.openFrom)}`}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text size="xs" weight="bold" className="tracking-wide">
              TUDO EM DIA ✓
            </Text>
            {statement.paidThrough && (
              <Text>Pago até {formatCalendarDate(statement.paidThrough)}</Text>
            )}
            {statement.credit > 0 && (
              <Text>Crédito de {formatCurrency(statement.credit)}</Text>
            )}
          </>
        )}
      </Box>
      {statement.current && (
        <Text tone="muted">
          Próximo vencimento: {formatCalendarDate(statement.current.due)} ·{" "}
          {formatCurrency(statement.current.amount)}
        </Text>
      )}

      {report.debts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Débitos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.debts.map((debt) => (
              <Box key={debt.label} className="space-y-1 rounded-md border p-3">
                <Text weight="medium">{debt.label}</Text>
                {debt.description && (
                  <Text size="xs" tone="muted">
                    {debt.description}
                  </Text>
                )}
                <Text>
                  {debt.balance > 0
                    ? `Falta ${formatCurrency(debt.balance)} de ${formatCurrency(debt.amount)}`
                    : "Quitado ✓"}
                </Text>
                <Meter
                  value={debt.amount > 0 ? 1 - debt.balance / debt.amount : 1}
                  color="hsl(var(--success-fg))"
                  className="h-1.5 rounded-full"
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {months.length > 0 && (
        <Card>
          <CardContent className="space-y-5 pt-4 md:pt-6">
            {months.map((month) => (
              <StatementMonthCalendar key={month.key} month={month} />
            ))}
            <Box className="flex flex-wrap gap-x-4 gap-y-2">
              {legend.map(([state, text]) => (
                <Box key={state} className="flex items-center gap-1.5">
                  <Box
                    aria-hidden
                    className={cn(
                      "inline-flex size-5 items-center justify-center rounded text-xs",
                      STATEMENT_DAY_CLASS[state],
                    )}
                  >
                    {STATEMENT_DAY_MARK[state]}
                  </Box>
                  <Text inline>{text}</Text>
                </Box>
              ))}
              {labels.closingLegend && (
                <Box className="flex items-center gap-1.5">
                  <Box
                    aria-hidden
                    className="inline-flex size-5 rounded ring-2 ring-inset ring-foreground/80"
                  />
                  <Text inline>{labels.closingLegend}</Text>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {statement.cycles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vigências e pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Phone: one card per cycle (owner's rule); table from md up. */}
            <List className="divide-y md:hidden">
              {statement.cycles.map((cycle, index) => {
                const text = labels.cycles[index];
                return (
                  <ListItem key={cycle.start} className="space-y-1 py-3">
                    <Box className="flex items-start justify-between gap-2">
                      <Box className="min-w-0">
                        <Text weight="medium">{text?.range}</Text>
                        <Text size="xs" tone="muted">
                          {text?.due}
                        </Text>
                      </Box>
                      <Text weight="semibold" className="shrink-0 tabular-nums">
                        {cycle.state === "WAIVED"
                          ? "–"
                          : formatCurrency(cycle.amount)}
                      </Text>
                    </Box>
                    {text?.payments.map((line, lineIndex) => (
                      <Box key={lineIndex}>
                        <Text size="xs">{line.text}</Text>
                        {line.note && (
                          <Text size="xs" tone="muted">
                            {line.note}
                          </Text>
                        )}
                      </Box>
                    ))}
                    <Badge variant={STATEMENT_CYCLE_BADGE[cycle.state]}>
                      {text?.state}
                    </Badge>
                  </ListItem>
                );
              })}
              {labels.totals.advance > 0 && (
                <ListItem className="flex justify-between gap-2 py-3">
                  <Text weight="medium">Adiantamento</Text>
                  <Text>{formatCurrency(labels.totals.advance)}</Text>
                </ListItem>
              )}
              <ListItem className="space-y-1 py-3">
                <Box className="flex justify-between gap-2">
                  <Text weight="semibold">Total</Text>
                  <Text weight="semibold" className="tabular-nums">
                    {formatCurrency(labels.totals.expected)}
                  </Text>
                </Box>
                <Box className="flex items-center justify-between gap-2">
                  <Text size="xs" tone="muted">
                    Pago {formatCurrency(labels.totals.paid)}
                  </Text>
                  <Badge
                    variant={STATEMENT_CYCLE_BADGE[labels.totalsState.state]}
                  >
                    {labels.totalsState.label}
                  </Badge>
                </Box>
              </ListItem>
            </List>
            <Box className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vigência</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statement.cycles.map((cycle, index) => {
                    const text = labels.cycles[index];
                    return (
                      <TableRow key={cycle.start}>
                        <TableCell className="align-top">
                          <Text weight="medium" className="whitespace-nowrap">
                            {text?.range}
                          </Text>
                          <Text size="xs" tone="muted">
                            {text?.due}
                          </Text>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right align-top">
                          {cycle.state === "WAIVED"
                            ? "–"
                            : formatCurrency(cycle.amount)}
                        </TableCell>
                        <TableCell className="align-top">
                          {text?.payments.length ? (
                            text.payments.map((line, lineIndex) => (
                              <Box key={lineIndex}>
                                <Text className="whitespace-nowrap">
                                  {line.text}
                                </Text>
                                {line.note && (
                                  <Text size="xs" tone="muted">
                                    {line.note}
                                  </Text>
                                )}
                              </Box>
                            ))
                          ) : (
                            <Text tone="muted">–</Text>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          <Badge
                            variant={STATEMENT_CYCLE_BADGE[cycle.state]}
                            className="whitespace-nowrap"
                          >
                            {text?.state}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {labels.totals.advance > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">
                        Adiantamento
                      </TableCell>
                      <TableCell className="text-right">–</TableCell>
                      <TableCell>
                        {formatCurrency(labels.totals.advance)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                  <TableRow className="bg-muted/50 font-medium hover:bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {formatCurrency(labels.totals.expected)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatCurrency(labels.totals.paid)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          STATEMENT_CYCLE_BADGE[labels.totalsState.state]
                        }
                        className="whitespace-nowrap"
                      >
                        {labels.totalsState.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}
      <Text size="xs" tone="muted">
        Gerado em {report.generatedAtLabel}
      </Text>
    </Box>
  );
}

export function RentStatementViewSkeleton() {
  return (
    <Box className="space-y-4">
      <Box className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Skeleton className="h-9 w-full sm:w-64" />
        <Skeleton className="h-9 w-full sm:w-36" />
      </Box>
      <Skeleton shape="text" className="w-3/4 text-sm" />
      <Skeleton className="h-28" />
      <Card>
        <CardContent className="space-y-3 pt-4 md:pt-6">
          <Skeleton shape="text" className="w-36 text-sm" />
          {Array.from({ length: 5 }, (_, row) => (
            <Box key={row} className="flex gap-1">
              {Array.from({ length: 7 }, (_, column) => (
                <Skeleton key={column} className="h-12 flex-1" />
              ))}
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
