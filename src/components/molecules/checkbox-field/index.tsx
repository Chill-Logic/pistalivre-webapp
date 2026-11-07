import { useId, type ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Checkbox } from "@/components/atoms/checkbox";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";

type CheckboxFieldProps = {
  label: string;
  /** Explanation under the label. */
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function CheckboxField({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: CheckboxFieldProps) {
  const id = useId();
  return (
    <Box className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        disabled={disabled}
        className="mt-0.5"
      />
      <Box className="space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer leading-snug">
          {label}
        </Label>
        {hint && (
          <Text size="xs" tone="muted">
            {hint}
          </Text>
        )}
      </Box>
    </Box>
  );
}
