import { ChevronLeft, ChevronRight } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { addMonths, currentMonth, formatMonth } from "@/utils/month";

type MonthSwitcherProps = {
  /** "YYYY-MM". */
  month: string;
  onChange: (month: string) => void;
};

/** ‹ novembro de 2026 › — plus a way back to this month. */
export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  const now = currentMonth();
  return (
    <Box className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label="Mês anterior"
        onClick={() => onChange(addMonths(month, -1))}
      >
        <ChevronLeft />
      </Button>
      <Text
        weight="semibold"
        className="min-w-36 text-center first-letter:uppercase"
        aria-live="polite"
      >
        {formatMonth(month)}
      </Text>
      <Button
        variant="outline"
        size="icon"
        aria-label="Próximo mês"
        onClick={() => onChange(addMonths(month, 1))}
      >
        <ChevronRight />
      </Button>
      {month !== now && (
        <Button variant="ghost" size="sm" onClick={() => onChange(now)}>
          Este mês
        </Button>
      )}
    </Box>
  );
}
