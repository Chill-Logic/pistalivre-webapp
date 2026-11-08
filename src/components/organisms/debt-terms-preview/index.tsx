import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { elapsedLabel } from "@/helpers/debt";
import { useDebtPreview } from "@/hooks/api/gestao/debts/useDebtPreviews";
import type { DebtPreviewInput } from "@/types/debt";
import { cn } from "@/utils/cn";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type DebtTermsPreviewProps = {
  /** null = principal and date not filled in yet (nothing to ask). */
  input: DebtPreviewInput | null;
};

/**
 * What will be paid back, in reais, as of today: the percentage only turns
 * into a decision when the staff sees the money. Computed by the server with
 * the same domain functions as the debt itself (nothing is saved).
 */
export function DebtTermsPreview({ input }: DebtTermsPreviewProps) {
  const preview = useDebtPreview(input);
  if (!input) {
    return (
      <Text size="xs" tone="muted">
        Informe o valor e a data do empréstimo para ver juros e total.
      </Text>
    );
  }
  const data = preview.data;
  const elapsed = data ? elapsedLabel(data.elapsedPeriods) : null;

  return (
    <Box
      aria-live="polite"
      aria-busy={preview.isFetching}
      className={cn(
        "space-y-1 rounded-md border bg-muted/40 p-3 transition-opacity",
        preview.isFetching && data && "opacity-60",
      )}
    >
      {preview.isError && !data ? (
        <Text size="xs" tone="muted">
          Não foi possível calcular a prévia agora.
        </Text>
      ) : !data ? (
        <>
          <Skeleton shape="text" className="w-48 text-sm" />
          <Skeleton shape="text" className="w-56 text-xs" />
        </>
      ) : (
        <>
          <Text weight="medium">
            Total a devolver hoje: {formatCurrency(data.total)}
          </Text>
          <Text size="xs" tone="muted">
            {data.interest > 0
              ? `Juros até hoje: ${formatCurrency(data.interest)}${elapsed ? ` (${elapsed})` : ""}`
              : "Sem juros."}
            {data.perPeriod > 0 &&
              input.interestPeriod !== "TOTAL" &&
              ` · ${formatCurrency(data.perPeriod)} por período`}
          </Text>
          {input.installments > 1 &&
            (data.installmentAmount != null && data.firstDue && data.lastDue ? (
              <Text size="xs" tone="muted">
                {input.installments}x de{" "}
                {formatCurrency(data.installmentAmount)}, de{" "}
                {formatCalendarDate(data.firstDue)} a{" "}
                {formatCalendarDate(data.lastDue)}.
              </Text>
            ) : (
              <Text size="xs" tone="muted">
                Informe a data da 1ª parcela para ver o plano.
              </Text>
            ))}
        </>
      )}
    </Box>
  );
}
