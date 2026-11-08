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
import { ratePeriodSuffix } from "@/helpers/billing";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useAddRateSegment } from "@/hooks/api/gestao/rentals/useBillingMutations";
import { useRateSegmentPreview } from "@/hooks/api/gestao/rentals/useRateSegmentPreview";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import type { RentalBilling } from "@/types/billing";
import type { RatePeriod } from "@/types/rental";
import { calendarDay } from "@/utils/date";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

const PERIODS: RatePeriod[] = ["DAILY", "WEEKLY", "MONTHLY"];
const PERIOD_OPTIONS = PERIODS.map((period) => ({
  value: period,
  label: `por ${ratePeriodSuffix(period)}`,
}));

type Errors = {
  from?: string;
  rate?: string;
  debtShare?: string;
  form?: string;
};

/**
 * New value of the rental from a date on, typed the way it is said ("450
 * por semana", "145 por semana de débito"). Days before the date keep their
 * value. A change of periodicity shows the server's preview (first due,
 * catch-up charges) before saving.
 */
export function RateSegmentDialog({ billing }: { billing: RentalBilling }) {
  const { rateSegments, autoBilling, today } = billing;
  const { current } = rateSegments;
  const add = useAddRateSegment(billing.rentalId);
  const idempotency = useIdempotencyKey();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [rate, setRate] = useState<number | null>(current.rate);
  const [period, setPeriod] = useState<RatePeriod>(current.ratePeriod);
  const [share, setShare] = useState<number | null>(current.debtShare || null);
  const [sharePeriod, setSharePeriod] = useState<RatePeriod>(
    current.debtSharePeriod,
  );
  const [errors, setErrors] = useState<Errors>({});

  const minFrom = calendarDay(rateSegments.minFrom);
  const firstUncovered = rateSegments.firstUncovered
    ? calendarDay(rateSegments.firstUncovered)
    : null;
  const periodChanged = period !== current.ratePeriod;
  const preview = useRateSegmentPreview(
    billing.rentalId,
    from,
    period,
    open && periodChanged && from > minFrom,
  );
  const transition = periodChanged ? preview.data?.preview : null;

  const onOpenChange = (next: boolean) => {
    if (add.isPending) return;
    setOpen(next);
    if (!next) return;
    setFrom("");
    setRate(current.rate);
    setPeriod(current.ratePeriod);
    setShare(current.debtShare || null);
    setSharePeriod(
      current.debtShare > 0 ? current.debtSharePeriod : current.ratePeriod,
    );
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!from) next.from = "Informe a data";
    else if (from <= minFrom) {
      next.from = `Tem que ser depois de ${formatCalendarDate(minFrom)}`;
    }
    if (!rate || rate <= 0) next.rate = "Informe o valor";
    setErrors(next);
    if (Object.keys(next).length > 0 || !rate) return;
    add.mutate(
      {
        key: idempotency.key,
        input: {
          from,
          rate,
          ratePeriod: period,
          ...(share && share > 0
            ? { debtShare: share, debtSharePeriod: sharePeriod }
            : {}),
        },
      },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
        },
        onError: (error) => {
          const fields = toApiError(error).fields ?? {};
          const placed = Boolean(
            fields.from || fields.rate || fields.debtShare,
          );
          setErrors({
            from: fields.from,
            rate: fields.rate,
            debtShare: fields.debtShare,
            form: placed ? undefined : moneyErrorMessage(error),
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Alterar valores
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Alterar valores</DialogTitle>
        <DialogDescription>
          Vale a partir da data escolhida. Os dias antes dela continuam com o
          valor que tinham.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Box className="space-y-1">
            <DateField
              label="A partir de"
              value={from}
              onChange={(value) => {
                setFrom(value);
                setErrors({});
              }}
              error={errors.from}
            />
            {firstUncovered &&
              firstUncovered > minFrom &&
              from !== firstUncovered && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setFrom(firstUncovered)}
                >
                  Usar {formatCalendarDate(firstUncovered)}: primeiro dia ainda
                  não cobrado
                </Button>
              )}
          </Box>
          <Row className="gap-y-4">
            <Col span={7}>
              <MoneyField
                label="Valor"
                value={rate}
                onChange={(value) => {
                  setRate(value);
                  setErrors({});
                }}
                error={errors.rate}
              />
            </Col>
            <Col span={5}>
              <SelectField
                label="Período"
                value={period}
                options={PERIOD_OPTIONS}
                onChange={(value) => setPeriod(value as RatePeriod)}
              />
            </Col>
            <Col span={7}>
              <MoneyField
                label="Parte para débitos (opcional)"
                value={share}
                onChange={setShare}
                error={errors.debtShare}
              />
            </Col>
            <Col span={5}>
              <SelectField
                label="Período"
                value={sharePeriod}
                options={PERIOD_OPTIONS}
                onChange={(value) => setSharePeriod(value as RatePeriod)}
              />
            </Col>
          </Row>
          {share != null && share > 0 && rate != null && rate > 0 && (
            <Text size="xs" tone="muted">
              De {formatCurrency(rate)} por {ratePeriodSuffix(period)},{" "}
              {formatCurrency(share)} por {ratePeriodSuffix(sharePeriod)} abatem
              débito do cliente.
            </Text>
          )}
          {periodChanged &&
            from > minFrom &&
            preview.isFetching &&
            !transition && (
              <Text size="xs" tone="muted">
                Calculando a troca de periodicidade…
              </Text>
            )}
          {transition ? (
            <Box className="space-y-1 rounded-md border p-3">
              <Text size="sm">
                A cobrança passa a ser por {ratePeriodSuffix(period)}, contando
                de {formatCalendarDate(transition.start)}: a primeira vence em{" "}
                <Text inline weight="semibold">
                  {formatCalendarDate(transition.firstDue)}
                </Text>
                .
              </Text>
              {transition.shiftedFrom && (
                <Text size="xs" tone="muted">
                  {formatCalendarDate(transition.shiftedFrom)} cai em domingo ou
                  feriado; o vencimento passa para o próximo dia útil, e o ciclo
                  seguinte continua contando de{" "}
                  {formatCalendarDate(transition.shiftedFrom)}.
                </Text>
              )}
              {transition.partialFrom && (
                <Text size="xs" tone="muted">
                  De {formatCalendarDate(transition.partialFrom)} até a véspera,
                  segue o valor atual, cobrado proporcional.
                </Text>
              )}
              {transition.catchUp > 0 && (
                <Text size="xs" className="text-warning-foreground">
                  {transition.catchUp === 1
                    ? "1 cobrança"
                    : `${transition.catchUp} cobranças`}{" "}
                  desde {formatCalendarDate(transition.start)} já{" "}
                  {transition.catchUp === 1 ? "venceu" : "venceram"}
                  {autoBilling.enabled
                    ? " e saem na hora, ao salvar."
                    : ": a cobrança automática está desligada, emita à mão."}
                </Text>
              )}
            </Box>
          ) : (
            from &&
            from < today && (
              <Text size="xs" className="text-warning-foreground">
                Data no passado: a conta é refeita de {formatCalendarDate(from)}{" "}
                até hoje com estes valores.
              </Text>
            )
          )}
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={add.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending && <Spinner className="text-primary-foreground" />}
              Salvar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
