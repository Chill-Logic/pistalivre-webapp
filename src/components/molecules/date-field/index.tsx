import { useId } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";
import { DateInput } from "@/components/molecules/date-input";

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

/**
 * One calendar day: typed (dd/mm/aaaa) or picked in our own calendar (never
 * the browser's date picker).
 */
export function DateField({
  label,
  value,
  onChange,
  error,
  placeholder = "dd/mm/aaaa",
  clearable = false,
}: DateFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <Box className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <DateInput
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        calendarFooter={
          clearable && value
            ? (close) => (
                <Box className="border-t p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onChange("");
                      close();
                    }}
                  >
                    Limpar data
                  </Button>
                </Box>
              )
            : undefined
        }
      />
      {error && (
        <Text id={errorId} tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
