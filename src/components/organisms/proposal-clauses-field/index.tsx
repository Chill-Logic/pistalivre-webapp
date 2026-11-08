import { Plus, Trash2 } from "lucide-react";
import {
  Controller,
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Heading } from "@/components/atoms/heading";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import type { ProposalTemplateValues } from "@/components/organisms/proposal-template-form/schema";
import { TemplateHtmlEditor } from "@/components/organisms/template-html-editor";
import type { TemplateVariableCatalog } from "@/types/template";

type ProposalClausesFieldProps = {
  control: Control<ProposalTemplateValues>;
  register: UseFormRegister<ProposalTemplateValues>;
  errors: FieldErrors<ProposalTemplateValues>;
  catalog: TemplateVariableCatalog | undefined;
};

/**
 * The optional clauses: each becomes a checkbox when issuing a proposal, and
 * the checked ones replace `{{{clauses}}}` in the body.
 */
export function ProposalClausesField({
  control,
  register,
  errors,
  catalog,
}: ProposalClausesFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "clauses",
  });

  return (
    <Box className="space-y-4">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Heading level={2} variant="section">
          Cláusulas opcionais (viram opção ao emitir)
        </Heading>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ label: "", html: "" })}
        >
          <Plus />
          Adicionar cláusula
        </Button>
      </Box>
      {fields.length === 0 ? (
        <Text tone="muted">
          Nenhuma cláusula. A proposta sai só com o corpo.
        </Text>
      ) : (
        <List className="space-y-4">
          {fields.map((field, index) => (
            <ListItem key={field.id}>
              <Card className="space-y-4 p-4">
                <Box className="flex items-end gap-2">
                  <Box className="min-w-0 flex-1">
                    <FormField
                      label={`Título da cláusula ${index + 1}`}
                      placeholder="Ex.: Manutenção"
                      {...register(`clauses.${index}.label`)}
                      error={errors.clauses?.[index]?.label?.message}
                    />
                  </Box>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    aria-label={`Remover cláusula ${index + 1}`}
                    onClick={() => remove(index)}
                  >
                    <Trash2 />
                  </Button>
                </Box>
                <Controller
                  control={control}
                  name={`clauses.${index}.html`}
                  render={({ field: html }) => (
                    <TemplateHtmlEditor
                      label="Texto da cláusula"
                      value={html.value}
                      onChange={html.onChange}
                      catalog={catalog}
                      error={errors.clauses?.[index]?.html?.message}
                    />
                  )}
                />
              </Card>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
