import { Settings2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Form } from "@/components/atoms/form";
import { Spinner } from "@/components/atoms/spinner";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { IntegrationField } from "@/components/molecules/integration-field";
import { toApiError } from "@/helpers/api-error";
import {
  integrationDefaults,
  integrationFieldFromMessage,
  missingIntegrationFields,
} from "@/helpers/integration";
import { useSaveIntegration } from "@/hooks/api/gestao/company/useIntegrationMutations";
import type { IntegrationConfig, IntegrationValues } from "@/types/company";

/**
 * A provider's keys, the form built from the API's catalog. Secrets never
 * come back: blank keeps the stored one. Admin only (the API answers 403).
 */
export function IntegrationFormDialog({
  integration,
}: {
  integration: IntegrationConfig;
}) {
  const { fields } = integration;
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<IntegrationValues>({});
  const [active, setActive] = useState(integration.active);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const save = useSaveIntegration(integration.provider);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setValues(integrationDefaults(fields));
    setActive(integration.active);
    setErrors({});
    setFormError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const missing = missingIntegrationFields(fields, values);
    setErrors(missing);
    setFormError(null);
    if (Object.keys(missing).length) return;

    save.mutate(
      { values, active },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          const fieldErrors = { ...(apiError.fields ?? {}) };
          const fromMessage = integrationFieldFromMessage(
            fields,
            apiError.message,
          );
          if (fromMessage) fieldErrors[fromMessage] = apiError.message;
          const placed = fields.some((field) => fieldErrors[field.key]);
          setErrors(fieldErrors);
          setFormError(placed ? null : apiError.message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 />
          {integration.configured ? "Editar" : "Configurar"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{integration.label}</DialogTitle>
        <DialogDescription>
          Guardado cifrado no banco e vale na hora, sem novo deploy. Senha em
          branco mantém a que está salva.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          {fields.map((field) => (
            <IntegrationField
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              onChange={(value) =>
                setValues((current) => ({ ...current, [field.key]: value }))
              }
              error={errors[field.key]}
              disabled={save.isPending}
            />
          ))}
          <CheckboxField
            label="Integração ativa"
            hint="Desligada, o sistema usa a configuração do servidor."
            checked={active}
            onChange={setActive}
            disabled={save.isPending}
          />
          {formError && <Alert>{formError}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={save.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
