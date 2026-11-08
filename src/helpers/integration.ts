import type {
  IntegrationConfig,
  IntegrationField,
  IntegrationValues,
} from "@/types/company";

/** Form start: stored values, checkbox groups as lists, secrets blank. */
export function integrationDefaults(fields: IntegrationField[]) {
  const values: IntegrationValues = {};
  for (const field of fields) {
    if (field.options?.length) {
      values[field.key] = field.value.split(/\s+/).filter(Boolean);
    } else {
      values[field.key] = field.secret ? "" : field.value;
    }
  }
  return values;
}

function isBlank(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length === 0;
  return !value?.trim();
}

/**
 * Required fields left empty (the API's rule): a blank secret already
 * stored is fine, it keeps the stored one.
 */
export function missingIntegrationFields(
  fields: IntegrationField[],
  values: IntegrationValues,
) {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!field.required || !isBlank(values[field.key])) continue;
    if (field.secret && field.isSet) continue;
    errors[field.key] = field.file
      ? "Escolha o arquivo"
      : `Preencha o campo "${field.label}"`;
  }
  return errors;
}

/** Badge of a provider: what the team needs to know at a glance. */
export function integrationStatus(integration: IntegrationConfig) {
  if (!integration.configured) {
    return { label: "Não configurada", variant: "warning" as const };
  }
  return integration.active
    ? { label: "Ativa", variant: "success" as const }
    : { label: "Desligada", variant: "outline" as const };
}

/** The API's message names the field ("Preencha o campo "API Token""). */
export function integrationFieldFromMessage(
  fields: IntegrationField[],
  message: string,
) {
  return fields.find((field) => message.includes(`"${field.label}"`))?.key;
}
