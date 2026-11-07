import type { ComponentProps } from "react";
import { FormField } from "@/components/molecules/form-field";

type MaskedFieldProps = Omit<
  ComponentProps<typeof FormField>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  mask: (value: string) => string;
};

/** FormField that formats as the user types (CPF, phone, CEP, date…). */
export function MaskedField({
  value,
  onChange,
  mask,
  ...props
}: MaskedFieldProps) {
  return (
    <FormField
      {...props}
      value={value}
      onChange={(event) => onChange(mask(event.target.value))}
    />
  );
}
