import { useEffect, useState } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { useInstallmentPlan } from "@/hooks/api/gestao/charges/useInstallmentPlan";
import type { ChargePlanItem, InstallmentPeriodicity } from "@/types/charge";
import { formatCurrency } from "@/utils/format";

const PERIODICITIES: { value: InstallmentPeriodicity; label: string }[] = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "BIWEEKLY", label: "Quinzenal" },
  { value: "MONTHLY", label: "Mensal" },
];

const MAX_INSTALLMENTS = 60;

type InstallmentComposerProps = {
  /** The installments to issue (preview with the edited dates). */
  onItemsChange: (items: ChargePlanItem[]) => void;
  /** API errors per installment (`items.<i>.<field>`), by index. */
  itemErrors?: Record<number, string>;
  disabled?: boolean;
};

/**
 * Total, how many, how often and the first due date → the server splits it
 * (the same split the management app uses; the last one takes the cents)
 * and each due date can still be moved. Purpose, method, fine/interest and
 * description belong to the parent form. Remount it to start over.
 */
export function InstallmentComposer({
  onItemsChange,
  itemErrors = {},
  disabled = false,
}: InstallmentComposerProps) {
  const [total, setTotal] = useState<number | null>(null);
  const [count, setCount] = useState("2");
  const [periodicity, setPeriodicity] =
    useState<InstallmentPeriodicity>("WEEKLY");
  const [firstDueDate, setFirstDueDate] = useState("");
  // Dates moved by hand, by index; a new split (driver change) drops them.
  const [moved, setMoved] = useState<Record<number, string>>({});

  const countNumber = Math.min(Number(count) || 0, MAX_INSTALLMENTS);
  const plan = useInstallmentPlan({
    total: total ?? 0,
    count: countNumber,
    periodicity,
    firstDueDate,
  });
  const ready = (total ?? 0) > 0 && countNumber >= 1 && Boolean(firstDueDate);
  const items = ready && plan.data ? plan.data : [];

  useEffect(() => {
    onItemsChange(
      items.map((item, index) => ({
        ...item,
        dueDate: moved[index] ?? item.dueDate,
      })),
    );
    // `items` is a new array only when the plan changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.data, ready, moved]);

  const drive =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setMoved({});
    };

  return (
    <Box className="space-y-4">
      <Row className="gap-y-4">
        <Col md={6}>
          <MoneyField
            label="Valor total"
            value={total}
            onChange={drive(setTotal)}
          />
        </Col>
        <Col span={6}>
          <FormField
            label="Parcelas"
            inputMode="numeric"
            value={count}
            onChange={(event) =>
              drive(setCount)(event.target.value.replace(/\D/g, "").slice(0, 2))
            }
            disabled={disabled}
          />
        </Col>
        <Col span={6}>
          <SelectField
            label="A cada"
            value={periodicity}
            options={PERIODICITIES}
            onChange={(value) =>
              drive(setPeriodicity)(value as InstallmentPeriodicity)
            }
            disabled={disabled}
          />
        </Col>
        <Col md={6}>
          <DateField
            label="1º vencimento"
            value={firstDueDate}
            onChange={drive(setFirstDueDate)}
          />
        </Col>
      </Row>

      {ready && plan.isPending && (
        <Box className="space-y-2" aria-busy>
          {Array.from({ length: Math.min(countNumber, 3) }, (_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </Box>
      )}
      {items.length > 0 && (
        <Box
          className={
            plan.isFetching
              ? "space-y-3 opacity-60 transition-opacity"
              : "space-y-3"
          }
        >
          <Text weight="medium">
            {items.length} {items.length === 1 ? "cobrança" : "cobranças"} de{" "}
            {formatCurrency(total ?? 0)} no total
          </Text>
          {items.map((item, index) => (
            <DateField
              key={index}
              label={`${item.label ?? `Parcela ${index + 1}`} · ${formatCurrency(item.amount)}`}
              value={moved[index] ?? item.dueDate}
              onChange={(value) =>
                setMoved((current) => ({ ...current, [index]: value }))
              }
              error={itemErrors[index]}
            />
          ))}
        </Box>
      )}
      {!ready && (
        <Text size="xs" tone="muted">
          Preencha o total, o número de parcelas e o 1º vencimento para ver as
          cobranças.
        </Text>
      )}
    </Box>
  );
}
