import { Plus, Trash2 } from "lucide-react";
import {
  Controller,
  useFieldArray,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Col, Row } from "@/components/atoms/grid";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import {
  MAX_EMERGENCY_CONTACTS,
  emptyEmergencyContact,
  type CustomerFormValues,
} from "@/components/organisms/customer-form/schema";
import { maskPhone } from "@/utils/masks";

type EmergencyContactsEditorProps = {
  control: Control<CustomerFormValues>;
  errors: FieldErrors<CustomerFormValues>;
};

/**
 * The customer's emergency contacts (up to 5): mother, spouse, friend… Each
 * e-mail gets a copy of the charges in Asaas and each contact can be picked
 * as a signer. All optional; an empty row is dropped on save.
 */
export function EmergencyContactsEditor({
  control,
  errors,
}: EmergencyContactsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContacts",
    keyName: "fieldId",
  });
  const rowErrors = errors.emergencyContacts;

  return (
    <Box className="space-y-3">
      {fields.length === 0 && (
        <Text size="sm" tone="muted">
          Nenhum contato. Quem avisar se não conseguirmos falar com o cliente?
        </Text>
      )}
      {fields.map((row, index) => (
        <Box key={row.fieldId} className="space-y-3 rounded-lg border p-3">
          <Box className="flex items-center justify-between gap-2">
            <Text size="sm" weight="medium">
              Contato {index + 1}
            </Text>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label={`Remover contato ${index + 1}`}
              title="Remover"
              className="text-destructive"
            >
              <Trash2 />
            </Button>
          </Box>
          <Row className="gap-y-4">
            <Col md={6}>
              <Controller
                control={control}
                name={`emergencyContacts.${index}.name`}
                render={({ field }) => (
                  <FormField
                    label="Nome"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={rowErrors?.[index]?.name?.message}
                  />
                )}
              />
            </Col>
            <Col md={6}>
              <Controller
                control={control}
                name={`emergencyContacts.${index}.relation`}
                render={({ field }) => (
                  <FormField
                    label="Vínculo"
                    placeholder="Mãe, cônjuge, amigo…"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={rowErrors?.[index]?.relation?.message}
                  />
                )}
              />
            </Col>
            <Col md={6}>
              <Controller
                control={control}
                name={`emergencyContacts.${index}.phone`}
                render={({ field }) => (
                  <MaskedField
                    label="Telefone"
                    inputMode="tel"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    mask={maskPhone}
                    error={rowErrors?.[index]?.phone?.message}
                  />
                )}
              />
            </Col>
            <Col md={6}>
              <Controller
                control={control}
                name={`emergencyContacts.${index}.email`}
                render={({ field }) => (
                  <FormField
                    label="E-mail"
                    type="email"
                    inputMode="email"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={rowErrors?.[index]?.email?.message}
                  />
                )}
              />
            </Col>
          </Row>
        </Box>
      ))}
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={fields.length >= MAX_EMERGENCY_CONTACTS}
          onClick={() => append(emptyEmergencyContact())}
        >
          <Plus />
          Adicionar contato
        </Button>
        <Text size="xs" tone="muted">
          O e-mail de cada contato recebe cópia das cobranças.
          {fields.length >= MAX_EMERGENCY_CONTACTS &&
            ` Limite de ${MAX_EMERGENCY_CONTACTS} contatos.`}
        </Text>
      </Box>
      {rowErrors?.message && (
        <Text size="sm" tone="destructive">
          {rowErrors.message}
        </Text>
      )}
    </Box>
  );
}
