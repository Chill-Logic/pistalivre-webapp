import { Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
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
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { DateField } from "@/components/molecules/date-field";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { rentSeriesHint } from "@/helpers/billing";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useSetAutoBilling } from "@/hooks/api/gestao/rentals/useBillingMutations";
import { useFirstChargePreview } from "@/hooks/api/gestao/rentals/useFirstChargePreview";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import type { RentalBilling } from "@/types/billing";
import { calendarDay, isDayString, weekdayOf } from "@/utils/date";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type Channel = RentalBilling["autoBilling"]["channel"];
type FirstAmount = "FULL" | "PRORATED";

const CHANNEL_OPTIONS = [
  { value: "asaas", label: "Pelo Asaas (pix/boleto com fatura)" },
  { value: "manual", label: "Fora do Asaas (cliente paga no nosso pix)" },
];

/**
 * Turning rent auto-billing on: the staff confirms where it charges and the
 * date of the FIRST charge, which is issued now and anchors the series.
 */
export function AutoBillingEnableDialog({
  billing,
}: {
  billing: RentalBilling;
}) {
  const { label } = useLabels();
  const setAutoBilling = useSetAutoBilling(billing.rentalId);
  const idempotency = useIdempotencyKey();
  const { autoBilling } = billing;
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<Channel>(autoBilling.channel);
  const [firstDueDate, setFirstDueDate] = useState("");
  const [firstAmount, setFirstAmount] = useState<FirstAmount>("PRORATED");
  const preview = useFirstChargePreview(
    billing.rentalId,
    open && isDayString(firstDueDate) ? firstDueDate : null,
  );
  const prorated = isDayString(firstDueDate)
    ? (preview.data?.prorated ?? null)
    : null;
  const [errors, setErrors] = useState<{
    firstDueDate?: string;
    form?: string;
  }>({});

  const onOpenChange = (next: boolean) => {
    if (setAutoBilling.isPending) return;
    setOpen(next);
    if (!next) return;
    setChannel(autoBilling.channel);
    setFirstAmount("PRORATED");
    setFirstDueDate(
      autoBilling.nextDueDate ? calendarDay(autoBilling.nextDueDate) : "",
    );
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!firstDueDate) {
      setErrors({ firstDueDate: "Informe a data da primeira cobrança" });
      return;
    }
    setAutoBilling.mutate(
      {
        key: idempotency.key,
        input: {
          enabled: true,
          channel,
          firstDueDate,
          firstChargeAmount: prorated ? firstAmount : "FULL",
        },
      },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
        },
        onError: (error) => {
          const fields = toApiError(error).fields ?? {};
          setErrors({
            firstDueDate: fields.firstDueDate,
            form: fields.firstDueDate ? undefined : moneyErrorMessage(error),
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Zap />
          Habilitar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Habilitar cobranças automáticas?</DialogTitle>
        <DialogDescription>
          O sistema gera as cobranças de aluguel sozinho (
          {label(LABEL_MAPS.rentBillingTiming, autoBilling.timing)}). A primeira
          é criada agora e ancora toda a série.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <SelectField
            label="Por onde cobrar"
            value={channel}
            options={CHANNEL_OPTIONS}
            onChange={(value) => setChannel(value as Channel)}
            disabled={setAutoBilling.isPending}
          />
          <Text size="xs" tone="muted">
            {channel === "manual"
              ? "As cobranças nascem só aqui, em aberto: nada vai ao Asaas e o cliente não recebe fatura. Quando ele pagar, use “Dar baixa”."
              : "As cobranças são emitidas no Asaas, com fatura e pix para o cliente."}
          </Text>
          <DateField
            label="Data da primeira cobrança"
            value={firstDueDate}
            onChange={(value) => {
              setFirstDueDate(value);
              setErrors({});
            }}
            error={errors.firstDueDate}
          />
          {billing.ratePeriod === "WEEKLY" &&
            billing.paymentWeekday != null &&
            isDayString(firstDueDate) &&
            weekdayOf(firstDueDate) !== billing.paymentWeekday && (
              <Alert variant="warning" role="note">
                {formatCalendarDate(firstDueDate)} é{" "}
                {label(LABEL_MAPS.weekday, String(weekdayOf(firstDueDate))).toLowerCase()}
                , mas a locação combina o pagamento na{" "}
                {label(LABEL_MAPS.weekday, String(billing.paymentWeekday)).toLowerCase()}
                . As cobranças seguem de 7 em 7 dias a partir desta data.
              </Alert>
            )}
          {prorated && preview.data && (
            <>
              <SegmentedField
                label="Valor da primeira cobrança"
                value={firstAmount}
                onChange={(value) => setFirstAmount(value as FirstAmount)}
                disabled={setAutoBilling.isPending}
                options={
                  prorated.extended
                    ? [
                        {
                          value: "PRORATED",
                          label: `${prorated.days} dias · ${formatCurrency(prorated.amount)}`,
                        },
                        {
                          value: "FULL",
                          label: `Só o ciclo · ${formatCurrency(preview.data.full)}`,
                        },
                      ]
                    : [
                        {
                          value: "PRORATED",
                          label: `Proporcional · ${formatCurrency(prorated.amount)}`,
                        },
                        {
                          value: "FULL",
                          label: `Inteiro · ${formatCurrency(preview.data.full)}`,
                        },
                      ]
                }
              />
              {prorated.extended && firstAmount === "FULL" && prorated.uncoveredThrough ? (
                <Alert variant="warning" role="note">
                  De {formatCalendarDate(prorated.from)} a{" "}
                  {formatCalendarDate(prorated.uncoveredThrough)} fica sem
                  cobrança: a automação não volta atrás para cobrar esses dias.
                </Alert>
              ) : (
                <Text size="xs" tone="muted">
                  {prorated.extended
                    ? `${prorated.days} dias, de ${formatCalendarDate(prorated.from)} a ${formatCalendarDate(prorated.through)}: o ciclo e os dias desde o início da locação, numa cobrança só.`
                    : firstAmount === "PRORATED"
                      ? `${prorated.days} de ${prorated.cycleDays} dias: de ${formatCalendarDate(prorated.from)} a ${formatCalendarDate(prorated.through)}.`
                      : "Cobra o ciclo inteiro, mesmo a locação tendo começado depois."}
                </Text>
              )}
            </>
          )}
          <Text size="xs" tone="muted">
            {rentSeriesHint(billing.ratePeriod)}
            {autoBilling.nextAmount != null &&
              ` Valor de cada uma: ${formatCurrency(autoBilling.nextAmount)}.`}
          </Text>
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={setAutoBilling.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={setAutoBilling.isPending}>
              {setAutoBilling.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Habilitar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
