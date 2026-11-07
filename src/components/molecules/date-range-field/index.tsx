import { CalendarDays } from "lucide-react";
import { useId, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Calendar } from "@/components/atoms/calendar";
import { Label } from "@/components/atoms/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import { Text } from "@/components/atoms/text";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { formatCalendarDate } from "@/utils/format";
import { fromDayString, toDayString } from "@/utils/date";

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
 * Pick a range in our own calendar (one month on phones, two on desktop).
 * Applies only when both ends are chosen.
 */
export function DateRangeField({
  label,
  start,
  end,
  max,
  onChange,
}: DateRangeFieldProps) {
  const id = useId();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();

  const selected = draft ?? {
    from: fromDayString(start),
    to: fromDayString(end),
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setDraft(undefined);
  };

  // First tap starts a NEW range (never stretches the current one); the
  // second closes it, in whichever order the two days were tapped.
  const handleDayClick = (day: Date) => {
    if (!draft?.from || draft.to) {
      setDraft({ from: day, to: undefined });
      return;
    }
    const [first, last] =
      day < draft.from ? [day, draft.from] : [draft.from, day];
    onChange({ start: toDayString(first), end: toDayString(last) });
    handleOpenChange(false);
  };

  return (
    <Box className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 bg-card px-3 text-base font-normal md:text-sm"
          >
            <CalendarDays className="text-muted-foreground" />
            <Text inline size={null} className="tabular-nums">
              {formatCalendarDate(`${start}T00:00:00Z`)} –{" "}
              {formatCalendarDate(`${end}T00:00:00Z`)}
            </Text>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={() => undefined}
            onDayClick={handleDayClick}
            numberOfMonths={isDesktop ? 2 : 1}
            defaultMonth={fromDayString(start)}
            disabled={max ? { after: fromDayString(max) } : undefined}
          />
          <Text size="xs" tone="muted" className="px-3 pb-3">
            {draft?.from && !draft.to
              ? "Agora escolha o último dia."
              : "Escolha o primeiro e o último dia."}
          </Text>
        </PopoverContent>
      </Popover>
    </Box>
  );
}
