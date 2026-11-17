import { useId } from "react";
import { Box } from "@/components/atoms/box";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";
import { formatMoneyInput, parseMoneyInput } from "@/utils/money";

type PercentFieldProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
};

/** Percentage input: digits fill from the hundredths ("349" → "3,49 %"), like the money field. */
export function PercentField({
  label,
  value,
  onChange,
  error,
}: PercentFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <Box className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Box className="relative">
        <Input
          id={id}
          inputMode="numeric"
          value={formatMoneyInput(value)}
          onChange={(event) => onChange(parseMoneyInput(event.target.value))}
          placeholder="0,00"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="pr-8 text-right tabular-nums"
        />
        <Text
          inline
          tone="muted"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        >
          %
        </Text>
      </Box>
      {error && (
        <Text id={errorId} tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
