import { useId, type ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Label } from "@/components/atoms/label";
import { Switch } from "@/components/atoms/switch";
import { Text } from "@/components/atoms/text";

type SwitchFieldProps = {
  label: string;
  /** Explanation under the label. */
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

/** An on/off setting: label (and hint) on the left, the switch on the right. */
export function SwitchField({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: SwitchFieldProps) {
  const id = useId();
  return (
    <Box className="flex items-start justify-between gap-3">
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
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </Box>
  );
}
