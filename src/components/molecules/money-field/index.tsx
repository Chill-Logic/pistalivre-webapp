import { useId } from "react";
import { Box } from "@/components/atoms/box";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";
import { formatMoneyInput, parseMoneyInput } from "@/utils/money";

type MoneyFieldProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
};

/** BRL input: digits fill from the cents ("R$ 0,05" → "R$ 1,50"). */
export function MoneyField({ label, value, onChange, error }: MoneyFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <Box className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Box className="relative">
        <Text
          inline
          tone="muted"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        >
          R$
        </Text>
        <Input
          id={id}
          inputMode="numeric"
          value={formatMoneyInput(value)}
          onChange={(event) => onChange(parseMoneyInput(event.target.value))}
          placeholder="0,00"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="pl-10 text-right tabular-nums"
        />
      </Box>
      {error && (
        <Text id={errorId} tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
