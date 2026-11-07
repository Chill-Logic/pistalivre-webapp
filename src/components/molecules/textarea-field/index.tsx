import { useId, type ComponentProps } from "react";
import { Box } from "@/components/atoms/box";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";
import { Textarea } from "@/components/atoms/textarea";

type TextareaFieldProps = ComponentProps<typeof Textarea> & {
  label: string;
  error?: string;
};

/** Label + textarea + validation message (the multi-line FormField). */
export function TextareaField({
  label,
  error,
  id,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <Box className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Textarea
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <Text id={errorId} tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
