import { useId, type ComponentProps } from "react";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";

type FormFieldProps = ComponentProps<typeof Input> & {
  label: string;
  error?: string;
};

/** Label + input + validation message, wired for screen readers. */
export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
