import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";

type CheckboxGroupFieldProps = {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  hint?: ReactNode;
  error?: string;
  disabled?: boolean;
};

/** Several choices at once (Radix checkboxes), the value is the list. */
export function CheckboxGroupField({
  label,
  options,
  value,
  onChange,
  hint,
  error,
  disabled,
}: CheckboxGroupFieldProps) {
  const toggle = (option: string, checked: boolean) =>
    onChange(
      checked
        ? [...value.filter((item) => item !== option), option]
        : value.filter((item) => item !== option),
    );

  return (
    <Box role="group" aria-label={label} className="space-y-2">
      <Label>{label}</Label>
      {hint && (
        <Text size="xs" tone="muted">
          {hint}
        </Text>
      )}
      <Box className="space-y-2 rounded-md border p-3">
        {options.map((option) => (
          <CheckboxField
            key={option.value}
            label={option.label}
            checked={value.includes(option.value)}
            onChange={(checked) => toggle(option.value, checked)}
            disabled={disabled}
          />
        ))}
      </Box>
      {error && <Text tone="destructive">{error}</Text>}
    </Box>
  );
}
