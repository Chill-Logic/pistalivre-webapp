import { CalendarDays } from "lucide-react";
import { useId, useState } from "react";
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
import { cn } from "@/utils/cn";
import { dayToBrDate, fromDayString, toDayString } from "@/utils/date";

type DateFieldProps = {
  label: string;
  /** yyyy-mm-dd, or "" when empty. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  /** Lets the user clear an optional date. */
  clearable?: boolean;
};

/** One calendar day in our own calendar (never the browser's date picker). */
export function DateField({
  label,
  value,
  onChange,
  error,
  placeholder = "Escolha a data",
  clearable = false,
}: DateFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [open, setOpen] = useState(false);

  return (
    <Box className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full justify-start gap-2 bg-card px-3 text-base font-normal md:text-sm",
              !value && "text-muted-foreground",
              error && "border-destructive",
            )}
          >
            <CalendarDays className="text-muted-foreground" />
            <Text inline size={null} className="tabular-nums">
              {value ? dayToBrDate(value) : placeholder}
            </Text>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          <Calendar
            mode="single"
            selected={value ? fromDayString(value) : undefined}
            defaultMonth={value ? fromDayString(value) : undefined}
            onSelect={(date) => {
              if (date) onChange(toDayString(date));
              setOpen(false);
            }}
          />
          {clearable && value && (
            <Box className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Limpar data
              </Button>
            </Box>
          )}
        </PopoverContent>
      </Popover>
      {error && (
        <Text id={errorId} tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
