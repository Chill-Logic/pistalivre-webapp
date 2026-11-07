import { Plus, X } from "lucide-react";
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import type {
  PlanFormInput,
  PlanFormValues,
} from "@/components/organisms/plan-form/schema";

const MAX_HIGHLIGHTS = 12;

type PlanHighlightsFieldProps = {
  control: Control<PlanFormInput, unknown, PlanFormValues>;
  register: UseFormRegister<PlanFormInput>;
  errors: FieldErrors<PlanFormInput>;
};

/** "O que está incluso": one row per item, as the questionnaire lists them. */
export function PlanHighlightsField({
  control,
  register,
  errors,
}: PlanHighlightsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "highlights",
  });
  const listError = errors.highlights?.message ?? errors.highlights?.root?.message;

  return (
    <Box className="space-y-2">
      <Label>O que está incluso</Label>
      <List className="space-y-2">
        {fields.map((field, index) => {
          const error = errors.highlights?.[index]?.value?.message;
          return (
            <ListItem key={field.id} className="space-y-1">
              <Box className="flex gap-2">
                <Input
                  aria-label={`Item ${index + 1}`}
                  placeholder="Ex.: Manutenção preventiva inclusa"
                  aria-invalid={Boolean(error)}
                  {...register(`highlights.${index}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover item ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <X />
                </Button>
              </Box>
              {error && <Text tone="destructive">{error}</Text>}
            </ListItem>
          );
        })}
      </List>
      {listError && <Text tone="destructive">{listError}</Text>}
      {fields.length < MAX_HIGHLIGHTS && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ value: "" })}
        >
          <Plus />
          Adicionar item
        </Button>
      )}
    </Box>
  );
}
