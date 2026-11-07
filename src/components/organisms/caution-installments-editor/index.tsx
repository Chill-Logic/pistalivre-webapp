import { Plus, Trash2 } from "lucide-react";
import {
  Controller,
  useFieldArray,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Col, Row } from "@/components/atoms/grid";
import { Text } from "@/components/atoms/text";
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
};

/** Entry + balances: each row is a charge-to-be (label, amount, due day). */
export function CautionInstallmentsEditor({
  control,
  errors,
  total,
  rowsTotal,
}: CautionInstallmentsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cautionInstallments",
    keyName: "fieldId",
  });
  const mismatch =
    total !== null && fields.length > 0 && Math.abs(rowsTotal - total) > 0.009;

  return (
    <Box className="space-y-3">
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
