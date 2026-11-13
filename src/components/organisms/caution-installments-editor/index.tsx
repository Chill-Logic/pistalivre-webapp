import { CalendarClock, Plus, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Col, Row } from "@/components/atoms/grid";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import { formatCalendarDate } from "@/utils/format";
import { weekdayOf } from "@/utils/date";
import { onOrAfterWeekday, weeklyDatesOn } from "@/utils/weekday";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import {
  newInstallmentKey,
  type RentalFormValues,
} from "@/components/organisms/rental-form/schema";
import { formatCurrency } from "@/utils/format";

type CautionInstallmentsEditorProps = {
  control: Control<RentalFormValues>;
  errors: FieldErrors<RentalFormValues>;
  /** Sum of the rows, compared with the caution total. */
  total: number | null;
  rowsTotal: number;
  /** The rental's start (yyyy-mm-dd): the entry is due on it. */
  startDate: string;
  /** Weekly rent with a payment weekday (0 = Sunday): installments go with it. */
  paymentWeekday: number | null;
};

/**
 * Entry + balances: each row is a charge-to-be (label, amount, due day). With
 * a weekly rent on a set weekday, the installments can be generated on that
 * weekday ("junto com a semanal") and any row off it is flagged — a contract
 * once had the rent on Monday and every installment on Sunday.
 */
export function CautionInstallmentsEditor({
  control,
  errors,
  total,
  rowsTotal,
  startDate,
  paymentWeekday,
}: CautionInstallmentsEditorProps) {
  const { label } = useLabels();
  const { fields, append, remove, replace, update } = useFieldArray({
    control,
    name: "cautionInstallments",
    keyName: "fieldId",
  });
  const rows = useWatch({ control, name: "cautionInstallments" }) ?? [];
  const mismatch =
    total !== null && fields.length > 0 && Math.abs(rowsTotal - total) > 0.009;

  const weekdayName =
    paymentWeekday != null
      ? label(LABEL_MAPS.weekday, String(paymentWeekday)).toLowerCase()
      : "";
  // A row off the rent's weekday (the entry, on the start day, is fine).
  const offDay = (dueDate: string) =>
    paymentWeekday != null &&
    /^\d{4}-\d{2}-\d{2}$/.test(dueDate) &&
    dueDate !== startDate &&
    weekdayOf(dueDate) !== paymentWeekday;
  const offRows = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => offDay(row?.dueDate ?? ""));
  const moveToWeekday = () => {
    if (paymentWeekday == null) return;
    for (const { row, index } of offRows) {
      update(index, { ...row, dueDate: onOrAfterWeekday(row.dueDate, paymentWeekday) });
    }
  };

  // "Junto com a semanal": entry on the start day + N installments on the weekday.
  const [genOpen, setGenOpen] = useState(false);
  const [entry, setEntry] = useState<number | null>(null);
  const [count, setCount] = useState("4");
  const [each, setEach] = useState<number | null>(null);
  const canGenerate =
    paymentWeekday != null &&
    Boolean(startDate) &&
    Number(count) > 0 &&
    each !== null &&
    each > 0;
  const generate = () => {
    if (!canGenerate || paymentWeekday == null || each === null) return;
    const dates = weeklyDatesOn(startDate, paymentWeekday, Number(count));
    replace([
      ...(entry && entry > 0
        ? [{ key: newInstallmentKey(), label: "Entrada", amount: entry, dueDate: startDate }]
        : []),
      ...dates.map((dueDate, i) => ({
        key: newInstallmentKey(),
        label: `Parcela ${i + 1} (junto com a semanal)`,
        amount: each,
        dueDate,
      })),
    ]);
    setGenOpen(false);
  };

  return (
    <Box className="space-y-3">
      {paymentWeekday != null && (
        <Box className="space-y-3 rounded-lg border border-dashed p-3">
          <Box className="flex flex-wrap items-center justify-between gap-2">
            <Text size="sm" tone="muted">
              Parcelas junto com a semanal: o sistema põe as datas na {weekdayName}.
            </Text>
            <Button type="button" variant="outline" size="sm" onClick={() => setGenOpen((v) => !v)}>
              <Wand2 />
              {genOpen ? "Fechar" : "Montar parcelas"}
            </Button>
          </Box>
          {genOpen && (
            <Row className="items-end gap-y-3">
              <Col span={12} md={4}>
                <MoneyField label="Entrada (no início)" value={entry} onChange={setEntry} />
              </Col>
              <Col span={6} md={3}>
                <FormField
                  label="Parcelas"
                  inputMode="numeric"
                  value={count}
                  onChange={(event) => setCount(event.target.value.replace(/\D/g, "").slice(0, 2))}
                />
              </Col>
              <Col span={6} md={3}>
                <MoneyField label="Valor de cada" value={each} onChange={setEach} />
              </Col>
              <Col span={12} md={2}>
                <Button type="button" onClick={generate} disabled={!canGenerate} className="w-full">
                  Gerar
                </Button>
              </Col>
              {fields.length > 0 && (
                <Col>
                  <Text size="xs" tone="muted">
                    Gerar substitui as parcelas abaixo.
                  </Text>
                </Col>
              )}
            </Row>
          )}
        </Box>
      )}
      {fields.map((row, index) => (
        <Box key={row.fieldId} className="rounded-lg border p-3">
          <Row className="items-end gap-y-3">
            <Col md={5}>
              <Controller
                control={control}
                name={`cautionInstallments.${index}.label`}
                render={({ field }) => (
                  <FormField
                    label="Descrição"
                    placeholder="Entrada, 2ª parcela…"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.cautionInstallments?.[index]?.label?.message}
                  />
                )}
              />
            </Col>
            <Col span={6} md={3}>
              <Controller
                control={control}
                name={`cautionInstallments.${index}.amount`}
                render={({ field }) => (
                  <MoneyField
                    label="Valor"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.cautionInstallments?.[index]?.amount?.message}
                  />
                )}
              />
            </Col>
            <Col span={6} md={3}>
              <Controller
                control={control}
                name={`cautionInstallments.${index}.dueDate`}
                render={({ field }) => (
                  <DateField
                    label="Vencimento"
                    value={field.value}
                    onChange={field.onChange}
                    error={
                      errors.cautionInstallments?.[index]?.dueDate?.message
                    }
                  />
                )}
              />
            </Col>
            {offDay(rows[index]?.dueDate ?? "") && (
              <Col className="md:order-last">
                <Text size="xs" className="text-warning-foreground">
                  {formatCalendarDate(rows[index].dueDate)} é{" "}
                  {label(LABEL_MAPS.weekday, String(weekdayOf(rows[index].dueDate))).toLowerCase()}; a semanal é na{" "}
                  {weekdayName}.
                </Text>
              </Col>
            )}
            <Col md={1} className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                aria-label={`Remover parcela ${index + 1}`}
                className="text-destructive"
              >
                <Trash2 />
              </Button>
            </Col>
          </Row>
        </Box>
      ))}
      {offRows.length > 0 && (
        <Alert variant="warning" role="note" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Text size="sm">
            {offRows.length === 1 ? "Uma parcela não cai" : `${offRows.length} parcelas não caem`} na {weekdayName}, o dia
            da semanal. Se é para cobrar junto, mova para a {weekdayName} seguinte.
          </Text>
          <Button type="button" variant="outline" size="sm" onClick={moveToWeekday} className="shrink-0">
            <CalendarClock />
            Mover para {weekdayName}
          </Button>
        </Alert>
      )}
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              key: newInstallmentKey(),
              label: "",
              amount: null,
              dueDate: "",
            })
          }
        >
          <Plus />
          Adicionar parcela
        </Button>
        {fields.length > 0 && (
          <Text size="xs" tone={mismatch ? "destructive" : "muted"}>
            Soma das parcelas: {formatCurrency(rowsTotal)}
            {mismatch &&
              total !== null &&
              ` · difere do total (${formatCurrency(total)})`}
          </Text>
        )}
      </Box>
      {errors.cautionInstallments?.message && (
        <Text tone="destructive">{errors.cautionInstallments.message}</Text>
      )}
    </Box>
  );
}
