import { useId } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";
import type { SelectOption } from "@/helpers/select";
import { cn } from "@/utils/cn";

type SegmentedFieldProps = {
  label: string;
  value: string;
  /** Few, short options (2–3): all visible side by side. */
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

/**
 * Label + a row of buttons where one is chosen (CPF | CNPJ), with a pill that
 * slides to it. For a choice among few options that should stay in view.
 */
export function SegmentedField({
  label,
  value,
  options,
  onChange,
  error,
  disabled = false,
}: SegmentedFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const index = options.findIndex((option) => option.value === value);
  const width = 100 / Math.max(options.length, 1);

  return (
    <Box className="space-y-2">
      <Label id={id}>{label}</Label>
      <Box
        role="group"
        aria-labelledby={id}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "relative flex w-full rounded-md border bg-muted/40 p-0.5",
          error && "border-destructive",
        )}
      >
        {index >= 0 && (
          <Box
            aria-hidden
            className="absolute inset-y-0.5 left-0.5 rounded bg-card shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
            style={{
              width: `calc(${width}% - 2px)`,
              transform: `translateX(${index * 100}%)`,
            }}
          />
        )}
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 h-10 flex-1 basis-0 px-2 hover:bg-transparent md:h-8",
              option.value === value
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            {option.label}
          </Button>
        ))}
      </Box>
      {error && (
        <Text id={errorId} tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
