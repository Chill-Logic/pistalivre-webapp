import { CalendarDays } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Calendar } from "@/components/atoms/calendar";
import { Input } from "@/components/atoms/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import { cn } from "@/utils/cn";
import {
  brDateToDay,
  dayToBrDate,
  fromDayString,
  toDayString,
} from "@/utils/date";
import { maskDate } from "@/utils/masks";

type DateInputProps = {
  id?: string;
  /** yyyy-mm-dd, or "" when empty or not a whole date yet. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Last allowed day (yyyy-mm-dd). */
  max?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
  "aria-label"?: string;
  /** Extra under the calendar (e.g. "Limpar data"). */
  calendarFooter?: (close: () => void) => ReactNode;
};

/** "15/11/26" → "15/11/2026" (2 digits: up to 10 years ahead is 20xx, else 19xx). */
function expandYear(text: string) {
  const short = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(text);
  if (!short) return text;
  const year = Number(short[3]);
  const limit = (new Date().getFullYear() + 10) % 100;
  return `${short[1]}/${short[2]}/${year <= limit ? 2000 + year : 1900 + year}`;
}

/**
 * A date you TYPE (dd/mm/aaaa, numbers only — the bars come by themselves;
 * "15/11/26" becomes 2026 on leaving the field) with our calendar one click
 * away, for whoever prefers to pick. A partial or impossible date doesn't
 * reach the form (it says "" until the date is whole and real).
 */
export function DateInput({
  id,
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  max,
  invalid,
  calendarFooter,
  ...aria
}: DateInputProps) {
  const [text, setText] = useState(value ? dayToBrDate(value) : "");
  const [wrong, setWrong] = useState(false);
  const [open, setOpen] = useState(false);

  // The form changed it (reset, the calendar, the assistant): show it.
  useEffect(() => {
    setText((current) =>
      (brDateToDay(current) ?? "") === value
        ? current
        : value
          ? dayToBrDate(value)
          : current.length === 10
            ? ""
            : current,
    );
  }, [value]);

  const apply = (next: string) => {
    setText(next);
    if (next.length < 10) {
      setWrong(false);
      if (value) onChange("");
      return;
    }
    const day = brDateToDay(next);
    const ok = Boolean(day) && (!max || (day as string) <= max);
    setWrong(!ok);
    onChange(ok ? (day as string) : "");
  };

  return (
    <Box className="relative">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={(event) => apply(maskDate(event.target.value))}
        onBlur={() => {
          const expanded = expandYear(text);
          if (expanded !== text) apply(expanded);
        }}
        aria-invalid={invalid || wrong || undefined}
        className={cn(
          "pr-10 tabular-nums",
          (invalid || wrong) && "border-destructive",
        )}
        {...aria}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Escolher no calendário"
            className="absolute right-0.5 top-1/2 size-9 -translate-y-1/2 text-muted-foreground md:size-8"
          >
            <CalendarDays />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="end">
          <Calendar
            mode="single"
            selected={value ? fromDayString(value) : undefined}
            defaultMonth={value ? fromDayString(value) : undefined}
            disabled={max ? { after: fromDayString(max) } : undefined}
            onSelect={(date) => {
              if (date) {
                const day = toDayString(date);
                setText(dayToBrDate(day));
                setWrong(false);
                onChange(day);
              }
              setOpen(false);
            }}
          />
          {calendarFooter?.(() => setOpen(false))}
        </PopoverContent>
      </Popover>
    </Box>
  );
}
