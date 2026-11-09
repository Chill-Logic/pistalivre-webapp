import { useId } from "react";
import { Box } from "@/components/atoms/box";
import { Label } from "@/components/atoms/label";
import { SegmentedControl } from "@/components/atoms/segmented-control";
import { Text } from "@/components/atoms/text";
import type { SelectOption } from "@/helpers/select";

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
 * Label + segmented control (CPF | CNPJ), the height of an input. For a
 * choice among few options that should stay in view.
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

  return (
    <Box className="space-y-2">
      <Label id={id}>{label}</Label>
      <SegmentedControl
        aria-labelledby={id}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onValueChange={onChange}
        options={options}
        invalid={Boolean(error)}
        disabled={disabled}
      />
      {error && (
        <Text id={errorId} tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
