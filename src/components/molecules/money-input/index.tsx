import { Input } from "@/components/atoms/input";
import { cn } from "@/utils/cn";
import { formatMoneyInput, parseMoneyInput } from "@/utils/money";

type MoneyInputProps = {
  /** Accessible name: there is no visible label (table cells). */
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
};

/**
 * Compact BRL input for dense tables, same typing as `MoneyField` (digits
 * fill from the cents). The column header is the visible label.
 */
export function MoneyInput({
  label,
  value,
  onChange,
  className,
}: MoneyInputProps) {
  return (
    <Input
      aria-label={label}
      inputMode="numeric"
      value={`R$ ${formatMoneyInput(value) || "0,00"}`}
      onChange={(event) => onChange(parseMoneyInput(event.target.value))}
      className={cn("h-8 w-[6.5rem] px-2 text-right tabular-nums md:h-8", className)}
    />
  );
}
