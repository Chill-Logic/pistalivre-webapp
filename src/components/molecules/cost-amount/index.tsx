import { Text } from "@/components/atoms/text";
import { brlEstimate, moneyIn } from "@/helpers/currency";
import type { Currency } from "@/types/currency";
import { cn } from "@/utils/cn";

type CostAmountProps = {
  /** In `currency`. */
  amount: number;
  currency: Currency;
  /** The same amount in reais (server math; null = no rate yet). */
  brl: number | null;
  /** Small text after the amount ("/ mês"). */
  suffix?: string;
  className?: string;
};

/**
 * A cost's amount. In reais, just the value; in another currency, the value
 * in it and the estimate in reais underneath.
 */
export function CostAmount({ amount, currency, brl, suffix, className }: CostAmountProps) {
  return (
    <Text weight="medium" className={cn("tabular-nums", className)}>
      {moneyIn(amount, currency)}
      {suffix && (
        <Text inline size="xs" tone="muted" weight="normal">
          {" "}
          {suffix}
        </Text>
      )}
      {currency !== "BRL" && (
        <Text inline size="xs" tone="muted" weight="normal" className="block">
          {brlEstimate(brl)}
        </Text>
      )}
    </Text>
  );
}
