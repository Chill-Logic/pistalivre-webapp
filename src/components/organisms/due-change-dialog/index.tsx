import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { DateField } from "@/components/molecules/date-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { ratePeriodSuffix } from "@/helpers/billing";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useChangeDue } from "@/hooks/api/gestao/rentals/useBillingMutations";
import { useDueChangePreview } from "@/hooks/api/gestao/rentals/useDueChangePreview";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import type {
  DueChangeInput,
  DueChangePreview,
  RentalBilling,
} from "@/types/billing";
import type { RatePeriod } from "@/types/rental";
import { addDays, daysInclusive, weekdayOf } from "@/utils/date";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

const PERIOD_OPTIONS: { value: RatePeriod; label: string }[] = [
  { value: "DAILY", label: "Diária" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensal" },
];

/**
 * "Trocar vencimento": another due day and/or cycle (weekly ↔ monthly ↔
 * daily), from the first day not yet charged. The server's preview says what
 * happens before saving: the old cycle's piece as its own prorated charge,
 * the first charge on the new day, and that nothing already charged moves
 * (an overdue one keeps its late fee).
 */
export function DueChangeDialog({ billing }: { billing: RentalBilling }) {
  const { current } = billing.rateSegments;
  const { options } = useLabels();
  const change = useChangeDue(billing.rentalId);
  const idempotency = useIdempotencyKey();
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<RatePeriod>(current.ratePeriod);
  const [weekday, setWeekday] = useState("");
  const [monthDay, setMonthDay] = useState("");
  const [rate, setRate] = useState<number | null>(current.rate);
  const [notBefore, setNotBefore] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // The preview follows the typed value once typing pauses.
  const typedRate = useDebouncedValue(rate, 400);
  const settled = typedRate === rate;
  const rule: DueChangeInput | null =
    !rate || rate <= 0
      ? null
      : period === "DAILY"
        ? { ratePeriod: period, rate }
        : period === "WEEKLY"
          ? weekday
            ? { ratePeriod: period, weekday: Number(weekday), rate }
            : null
          : monthDay
            ? { ratePeriod: period, monthDay: Number(monthDay), rate }
            : null;
  const input = rule && notBefore ? { ...rule, notBefore } : rule;
  const preview = useDueChangePreview(
    billing.rentalId,
    open && settled ? input : null,
  );
  const previewError =
    input && preview.isError ? toApiError(preview.error) : null;
  const ready =
    settled && input !== null && preview.data && !preview.isPlaceholderData;

  const onOpenChange = (next: boolean) => {
    if (change.isPending) return;
    setOpen(next);
    if (!next) return;
    setPeriod(current.ratePeriod);
    setWeekday("");
    setMonthDay("");
    setRate(current.rate);
    setNotBefore("");
    setFormError(null);
  };

  const pickPeriod = (value: RatePeriod) => {
    setPeriod(value);
    // Another cycle asks for its own value ("450 por semana" ≠ "1.800 por mês").
    setRate(value === current.ratePeriod ? current.rate : null);
    setFormError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!input || !ready) return;
    change.mutate(
      { key: idempotency.key, input },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
        },
        onError: (error) => setFormError(moneyErrorMessage(error)),
      },
    );
  };

  const maxDay = billing.dueChange.maxMonthDay;
  const dayOptions = Array.from({ length: maxDay }, (_, index) => ({
    value: String(index + 1),
    label: `Dia ${index + 1}`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Trocar vencimento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Trocar vencimento</DialogTitle>
        <DialogDescription>
          Sem data, vale o quanto antes: do primeiro dia ainda não cobrado. O
          que já foi cobrado não muda.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            <Col span={period === "DAILY" ? 12 : 6}>
              <SelectField
                label="Ciclo"
                value={period}
                options={PERIOD_OPTIONS}
                onChange={(value) => pickPeriod(value as RatePeriod)}
                disabled={change.isPending}
              />
            </Col>
            {period === "WEEKLY" && (
              <Col span={6}>
                <SelectField
                  label="Vence toda"
                  value={weekday}
                  // No Sunday: it would fall due on Monday anyway.
                  options={options(LABEL_MAPS.weekday).filter(
                    (option) => option.value !== "0",
                  )}
                  placeholder="Dia da semana"
                  onChange={(value) => {
                    setWeekday(value);
                    setFormError(null);
                  }}
                  disabled={change.isPending}
                />
              </Col>
            )}
            {period === "MONTHLY" && (
              <Col span={6}>
                <SelectField
                  label="Vence todo"
                  value={monthDay}
                  options={dayOptions}
                  placeholder="Dia do mês"
                  onChange={(value) => {
                    setMonthDay(value);
                    setFormError(null);
                  }}
                  disabled={change.isPending}
                />
              </Col>
            )}
            <Col md={6}>
              <MoneyField
                label={`Valor por ${ratePeriodSuffix(period)}`}
                value={rate}
                onChange={(value) => {
                  setRate(value);
                  setFormError(null);
                }}
              />
            </Col>
            <Col md={6}>
              <DateField
                label="A partir de (opcional)"
                value={notBefore}
                onChange={(value) => {
                  setNotBefore(value);
                  setFormError(null);
                }}
              />
            </Col>
          </Row>
          {input && preview.isFetching && !ready && !previewError && (
            <Text size="xs" tone="muted">
              Calculando a troca…
            </Text>
          )}
          {previewError && (
            <Alert variant="warning">
              {Object.values(previewError.fields ?? {})[0] ??
                previewError.message}
            </Alert>
          )}
          {ready && !previewError && (
            <DueChangeSummary
              preview={preview.data}
              input={input!}
              billing={billing}
            />
          )}
          {formError && <Alert>{formError}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={change.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={change.isPending || !ready || Boolean(previewError)}
            >
              {change.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Trocar vencimento
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The plan in the customer's words: the operator can send a print of this
 * box. Team-only notes (auto-billing, uncharged cycles) stay outside it.
 */
function DueChangeSummary({
  preview,
  input,
  billing,
}: {
  preview: DueChangePreview;
  input: DueChangeInput;
  billing: RentalBilling;
}) {
  const { label } = useLabels();
  const { bridge, first, uncharged } = preview.plan;
  const { current, firstUncovered } = billing.rateSegments;
  const changeStart = bridge?.start ?? first.start;
  // The old rule still runs for a while (whole weeks before a monthly one).
  const keepsGoing = changeStart > (firstUncovered ?? "");
  const day = (iso: string) =>
    `${label(LABEL_MAPS.weekday, weekdayOf(iso)).toLowerCase()}, ${formatCalendarDate(iso)}`;
  const rule =
    input.ratePeriod === "WEEKLY"
      ? // "todo sábado", "toda segunda" (Sunday is not an option).
        `por semana, vencendo ${input.weekday === 6 ? "todo" : "toda"} ${label(LABEL_MAPS.weekday, input.weekday ?? 1).toLowerCase()}`
      : input.ratePeriod === "MONTHLY"
        ? `por mês, vencendo todo dia ${input.monthDay}`
        : "por dia";

  return (
    <Box className="space-y-2" aria-live="polite">
      <Box className="space-y-3 rounded-md border p-4">
        <Text weight="semibold">Como fica o pagamento</Text>
        {keepsGoing && (
          <Text size="sm">
            Até {formatCalendarDate(addDays(changeStart, -1))}, nada muda:{" "}
            {formatCurrency(current.rate)} por{" "}
            {ratePeriodSuffix(current.ratePeriod)}, como hoje.
          </Text>
        )}
        {bridge && (
          <Box>
            <Text size="sm" weight="medium">
              Ajuste da troca
            </Text>
            <Text size="sm">
              {daysInclusive(bridge.start, bridge.end) === 1
                ? `O dia ${formatCalendarDate(bridge.start)}`
                : `Os ${daysInclusive(bridge.start, bridge.end)} dias de ${formatCalendarDate(bridge.start)} a ${formatCalendarDate(bridge.end)}`}
              :{" "}
              <Text inline weight="semibold">
                {formatCurrency(bridge.amount)}
              </Text>
              , vence {day(bridge.due)}.
            </Text>
          </Box>
        )}
        <Box>
          <Text size="sm" weight="medium">
            {bridge ? "Depois" : `A partir de ${formatCalendarDate(first.start)}`}
          </Text>
          <Text size="sm">
            <Text inline weight="semibold">
              {formatCurrency(first.amount)}
            </Text>{" "}
            {rule}. A primeira vence {day(first.due)}.
          </Text>
        </Box>
        {preview.overdue.length > 0 && (
          <Box>
            <Text size="sm" weight="medium">
              Em aberto
            </Text>
            {preview.overdue.map((charge) => (
              <Text key={charge.id} size="sm">
                Vencida em {formatCalendarDate(charge.dueDate)}:{" "}
                {charge.surcharge > 0 ? (
                  <>
                    {formatCurrency(charge.amount)} +{" "}
                    {formatCurrency(charge.surcharge)} de multa e juros ={" "}
                    <Text inline weight="semibold">
                      {formatCurrency(charge.total)}
                    </Text>{" "}
                    hoje.
                  </>
                ) : (
                  <Text inline weight="semibold">
                    {formatCurrency(charge.amount)}
                  </Text>
                )}
              </Text>
            ))}
            <Text size="xs" tone="muted">
              {preview.overdue.length === 1
                ? "Continua valendo como está; a troca não muda essa cobrança."
                : "Continuam valendo como estão; a troca não muda essas cobranças."}
            </Text>
          </Box>
        )}
      </Box>
      <Text size="xs" tone="muted">
        {preview.autoBilling
          ? "A cobrança automática emite cada uma no tempo de sempre."
          : "A cobrança automática está desligada: emita as cobranças à mão."}
      </Text>
      {uncharged > 0 && (
        <Alert variant="warning">
          {uncharged === 1
            ? "1 ciclo anterior já venceu sem cobrança"
            : `${uncharged} ciclos anteriores já venceram sem cobrança`}
          : a troca não {uncharged === 1 ? "o emite" : "os emite"}.
        </Alert>
      )}
    </Box>
  );
}
