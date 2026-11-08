import { FileX2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
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
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { OTHER_TERMINATION_REASON } from "@/constants/rental";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import {
  useTerminateRental,
  useTerminationPreview,
} from "@/hooks/api/gestao/rentals/useRentalTermination";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import type { RentalDetail } from "@/types/rental";
import { todayInBrasilia } from "@/utils/date";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

type Errors = Partial<
  Record<"date" | "reasons" | "otherReason" | "form", string>
>;

/**
 * "Rescindir": ends an ACTIVE rental on a date, with reasons. The server
 * turns off the automatic billing, frees the vehicle and deletes the open
 * charges due after the date; the ones due up to it stay (the customer's
 * debt). The preview below says exactly what will happen.
 */
export function RentalTerminationDialog({
  rental,
}: {
  rental: Pick<RentalDetail, "id" | "code" | "source">;
}) {
  const { label, options } = useLabels();
  const terminate = useTerminateRental(rental.id);
  const idempotency = useIdempotencyKey();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [reasons, setReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const preview = useTerminationPreview(rental.id, date, open);
  const withOther = reasons.includes(OTHER_TERMINATION_REASON);

  const onOpenChange = (next: boolean) => {
    if (terminate.isPending) return;
    setOpen(next);
    if (!next) return;
    setDate(todayInBrasilia());
    setReasons([]);
    setOtherReason("");
    setNotes("");
    setErrors({});
  };

  const toggleReason = (code: string, checked: boolean) => {
    setReasons((current) =>
      checked ? [...current, code] : current.filter((r) => r !== code),
    );
    setErrors((current) => ({ ...current, reasons: undefined }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!date) next.date = "Informe a data da rescisão";
    else if (date > todayInBrasilia())
      next.date = "A data não pode ser no futuro";
    if (reasons.length === 0) next.reasons = "Marque ao menos um motivo";
    if (withOther && !otherReason.trim())
      next.otherReason = "Descreva o motivo";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    terminate.mutate(
      {
        key: idempotency.key,
        input: {
          date,
          reasons,
          ...(withOther ? { otherReason: otherReason.trim() } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      },
      {
        onSuccess: ({ cancelledCharges, failures }) => {
          idempotency.renew();
          setOpen(false);
          toast.success(
            cancelledCharges.length > 0
              ? `Locação rescindida · ${pluralize(cancelledCharges.length, "cobrança cancelada", "cobranças canceladas")}`
              : "Locação rescindida",
          );
          if (failures.length > 0) {
            toast.warning(
              `${pluralize(failures.length, "cobrança não foi cancelada", "cobranças não foram canceladas")} no Asaas: confira em Cobranças.`,
              { description: failures.map((f) => f.message).join(" · ") },
            );
          }
        },
        onError: (error) => {
          const fields = toApiError(error).fields ?? {};
          setErrors({
            date: fields.date,
            reasons: fields.reasons,
            otherReason: fields.otherReason,
            form:
              fields.date || fields.reasons || fields.otherReason
                ? undefined
                : moneyErrorMessage(error),
          });
        },
      },
    );
  };

  const toCancel = preview.data?.chargesToCancel ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <FileX2 />
          Rescindir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogTitle>Rescindir a locação {rental.code}?</DialogTitle>
        <DialogDescription>
          A locação é encerrada na data abaixo e o aluguel é cobrado até ela.
          Isso não pode ser desfeito.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <DateField
            label="Data da rescisão"
            value={date}
            onChange={(value) => {
              setDate(value);
              setErrors((current) => ({ ...current, date: undefined }));
            }}
            error={errors.date}
          />

          <Box role="group" aria-label="Motivos" className="space-y-2">
            <Text weight="medium">Motivos</Text>
            {options(LABEL_MAPS.rentalTerminationReason).map((option) => (
              <CheckboxField
                key={option.value}
                label={option.label}
                checked={reasons.includes(option.value)}
                onChange={(checked) => toggleReason(option.value, checked)}
                disabled={terminate.isPending}
              />
            ))}
            {errors.reasons && (
              <Text size="xs" tone="destructive">
                {errors.reasons}
              </Text>
            )}
          </Box>
          {withOther && (
            <FormField
              label="Qual o motivo?"
              value={otherReason}
              onChange={(event) => {
                setOtherReason(event.target.value);
                setErrors((current) => ({
                  ...current,
                  otherReason: undefined,
                }));
              }}
              error={errors.otherReason}
            />
          )}
          <TextareaField
            label="Observação (opcional)"
            placeholder="Ex.: veículo recolhido na base em 07/11, com 3 semanas em atraso."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />

          <Box className="space-y-2 rounded-md border p-3">
            <Text weight="medium">O que acontece</Text>
            {preview.isPending ? (
              <Box className="space-y-2">
                <Skeleton shape="text" className="w-3/4 text-sm" />
                <Skeleton shape="text" className="w-2/3 text-sm" />
              </Box>
            ) : preview.isError ? (
              <Text size="xs" tone="destructive">
                {moneyErrorMessage(preview.error)}
              </Text>
            ) : (
              <Box className="space-y-1">
                <Text size="xs" tone="muted">
                  · A situação passa a{" "}
                  {label(LABEL_MAPS.rentalStatus, "RETURNED").toLowerCase()}.
                </Text>
                {preview.data?.autoBillingEnabled && (
                  <Text size="xs" tone="muted">
                    · A cobrança automática é desligada.
                  </Text>
                )}
                {rental.source === "SYSTEM" && preview.data?.vehicle && (
                  <Text size="xs" tone="muted">
                    · O veículo {preview.data.vehicle.plate} volta a ficar
                    disponível.
                  </Text>
                )}
                {toCancel.length === 0 ? (
                  <Text size="xs" tone="muted">
                    · Nenhuma cobrança em aberto vence depois de{" "}
                    {formatCalendarDate(date)}.
                  </Text>
                ) : (
                  <>
                    <Text size="xs" weight="medium" tone="destructive">
                      ·{" "}
                      {pluralize(
                        toCancel.length,
                        "cobrança em aberto que vence depois da data é excluída",
                        "cobranças em aberto que vencem depois da data são excluídas",
                      )}{" "}
                      (no Asaas também):
                    </Text>
                    {toCancel.map((charge) => (
                      <Text
                        key={charge.id}
                        size="xs"
                        tone="muted"
                        className="pl-3"
                      >
                        {formatCalendarDate(charge.dueDate)} ·{" "}
                        {charge.description ??
                          label(LABEL_MAPS.paymentPurpose, charge.purpose)}{" "}
                        · {formatCurrency(charge.amount)}
                      </Text>
                    ))}
                  </>
                )}
                <Text size="xs" tone="muted">
                  · As vencidas até a data continuam em aberto (dívida do
                  cliente).
                </Text>
              </Box>
            )}
          </Box>

          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={terminate.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={terminate.isPending || preview.isPending}
            >
              {terminate.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Rescindir locação
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
