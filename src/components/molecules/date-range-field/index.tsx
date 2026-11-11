import { useEffect, useId, useState } from "react";
import { Box } from "@/components/atoms/box";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";
import { DateInput } from "@/components/molecules/date-input";

type DateRangeFieldProps = {
  label: string;
  /** yyyy-mm-dd */
  start: string;
  end: string;
  /** Last selectable day (yyyy-mm-dd), e.g. today in Brasília. */
  max?: string;
  onChange: (range: { start: string; end: string }) => void;
};

/**
 * A period typed (dd/mm/aaaa, with the mask) or picked in the calendar, one
 * end at a time. Applies only when both ends are whole dates and in order.
 */
export function DateRangeField({
  label,
  start,
  end,
  max,
  onChange,
}: DateRangeFieldProps) {
  const id = useId();
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);

  // The page changed the period (another filter, a link): follow it.
  useEffect(() => setFrom(start), [start]);
  useEffect(() => setTo(end), [end]);

  const commit = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
    if (nextFrom && nextTo && nextFrom <= nextTo) {
      if (nextFrom !== start || nextTo !== end) {
        onChange({ start: nextFrom, end: nextTo });
      }
    }
  };
  const reversed = Boolean(from && to && from > to);

  return (
    <Box className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Box className="flex items-center gap-2">
        <Box className="min-w-0 flex-1">
          <DateInput
            id={id}
            aria-label={`${label}: de`}
            value={from}
            max={max}
            invalid={reversed}
            onChange={(day) => commit(day, to)}
          />
        </Box>
        <Text inline tone="muted" aria-hidden>
          até
        </Text>
        <Box className="min-w-0 flex-1">
          <DateInput
            aria-label={`${label}: até`}
            value={to}
            max={max}
            invalid={reversed}
            onChange={(day) => commit(from, day)}
          />
        </Box>
      </Box>
      {reversed && (
        <Text size="sm" tone="destructive">
          A data inicial é depois da final.
        </Text>
      )}
    </Box>
  );
}
