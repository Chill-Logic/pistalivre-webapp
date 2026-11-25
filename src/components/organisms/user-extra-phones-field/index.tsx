import { Plus, X } from "lucide-react";
import {
  Controller,
  useFieldArray,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import type { UserFormValues } from "@/components/organisms/user-form";
import { maskPhone } from "@/utils/masks";

/** The API's limit (MAX_EXTRA_PHONES). */
const MAX_EXTRA_PHONES = 5;

type UserExtraPhonesFieldProps = {
  control: Control<UserFormValues>;
  errors: FieldErrors<UserFormValues>;
};

/**
 * "Outros telefones": numbers of the same person (the company mobile they
 * use). The Livrinho on WhatsApp answers them as this user.
 */
export function UserExtraPhonesField({
  control,
  errors,
}: UserExtraPhonesFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "extraPhones",
  });
  const listError =
    errors.extraPhones?.message ?? errors.extraPhones?.root?.message;

  return (
    <Box className="space-y-2">
      <Label>Outros telefones (opcional)</Label>
      <Text tone="muted" className="text-sm">
        Números da mesma pessoa, como o celular da empresa que ela usa. Por
        eles o Livrinho no WhatsApp atende como se fosse ela.
      </Text>
      {fields.length > 0 && (
        <List className="space-y-2">
          {fields.map((field, index) => {
            const error = errors.extraPhones?.[index]?.value?.message;
            return (
              <ListItem key={field.id} className="space-y-1">
                <Box className="flex gap-2">
                  <Controller
                    control={control}
                    name={`extraPhones.${index}.value`}
                    render={({ field: input }) => (
                      <Input
                        aria-label={`Outro telefone ${index + 1}`}
                        placeholder="(00) 00000-0000"
                        inputMode="tel"
                        aria-invalid={Boolean(error)}
                        value={input.value}
                        onChange={(event) =>
                          input.onChange(maskPhone(event.target.value))
                        }
                        onBlur={input.onBlur}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover telefone ${index + 1}`}
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
      )}
      {listError && <Text tone="destructive">{listError}</Text>}
      {fields.length < MAX_EXTRA_PHONES && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ value: "" })}
        >
          <Plus />
          Adicionar telefone
        </Button>
      )}
    </Box>
  );
}
