import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { CheckboxGroupField } from "@/components/molecules/checkbox-group-field";
import { FormField } from "@/components/molecules/form-field";
import { PasswordField } from "@/components/molecules/password-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextFileField } from "@/components/molecules/text-file-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import type { IntegrationField as Field } from "@/types/company";

type IntegrationFieldProps = {
  field: Field;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
  disabled?: boolean;
};

const KEPT_PLACEHOLDER = "•••• (mantido)";

/**
 * One input of a provider's form, picked by what the API's catalog says:
 * checkbox group, single choice, text file, textarea, password (secret) or text. A stored
 * secret shows "•••• (mantido)" and blank keeps it.
 */
export function IntegrationField({
  field,
  value,
  onChange,
  error,
  disabled,
}: IntegrationFieldProps) {
  const label = field.required ? field.label : `${field.label} — opcional`;
  const text = Array.isArray(value) ? value.join(" ") : value;
  const placeholder =
    field.secret && field.isSet
      ? KEPT_PLACEHOLDER
      : (field.placeholder ?? undefined);
  const help = field.help ? (
    <Text size="xs" tone="muted">
      {field.help}
    </Text>
  ) : null;

  if (field.options?.length) {
    return (
      <CheckboxGroupField
        label={label}
        options={field.options}
        value={Array.isArray(value) ? value : value.split(/\s+/).filter(Boolean)}
        onChange={onChange}
        hint={field.help}
        error={error}
        disabled={disabled}
      />
    );
  }

  if (field.choices?.length) {
    return (
      <Box className="space-y-1">
        <SelectField
          label={label}
          value={text}
          options={field.choices}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
        {help}
      </Box>
    );
  }

  if (field.file) {
    return (
      <TextFileField
        label={label}
        value={text}
        onChange={onChange}
        accept={field.accept ?? undefined}
        isSet={field.isSet}
        hint={field.help}
        error={error}
        disabled={disabled}
      />
    );
  }

  if (field.multiline) {
    return (
      <Box className="space-y-1">
        <TextareaField
          label={label}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          rows={5}
          className="font-mono text-xs"
          error={error}
          disabled={disabled}
        />
        {help}
      </Box>
    );
  }

  if (field.secret) {
    return (
      <Box className="space-y-1">
        <PasswordField
          label={label}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          error={error}
          disabled={disabled}
        />
        {help}
      </Box>
    );
  }

  return (
    <Box className="space-y-1">
      <FormField
        label={label}
        value={text}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        error={error}
        disabled={disabled}
      />
      {help}
    </Box>
  );
}
