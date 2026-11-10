import { useId } from "react";
import { Box } from "@/components/atoms/box";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";
import { currencySymbol } from "@/utils/format";
import { formatMoneyInput, parseMoneyInput } from "@/utils/money";

type MoneyFieldProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  /** ISO code of the amount (default BRL): only changes the symbol. */
  currency?: string;
  /** Line under the field (e.g. the amount in reais). */
  hint?: string;
};

/** Money input: digits fill from the cents ("R$ 0,05" → "R$ 1,50"). */
export function MoneyField({
  label,
  value,
  onChange,
  error,
  currency = "BRL",
  hint,
}: MoneyFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const symbol = currencySymbol(currency);

  return (
    <Box className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Box className="relative">
        <Text
          inline
          tone="muted"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        >
          {symbol}
        </Text>
        <Input
          id={id}
          inputMode="numeric"
          value={formatMoneyInput(value)}
          onChange={(event) => onChange(parseMoneyInput(event.target.value))}
          placeholder="0,00"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn("text-right tabular-nums", symbol.length > 2 ? "pl-12" : "pl-10")}
        />
      </Box>
      {hint && !error && (
        <Text id={hintId} size="xs" tone="muted">
          {hint}
        </Text>
      )}
      {error && (
        <Text id={errorId} tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
