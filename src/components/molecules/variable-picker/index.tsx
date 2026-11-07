import { Braces } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/atoms/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import { Text } from "@/components/atoms/text";
import type { TemplateVariableCatalog } from "@/types/template";

type VariablePickerProps = {
  catalog: TemplateVariableCatalog | undefined;
  /** The caução slot is offered only in the contract body. */
  withSlots: boolean;
  /** Text to insert: `{{key}}`, or `{{{key}}}` for a slot. */
  onPick: (text: string) => void;
};

/** Searchable list of the template variables, grouped as in the API. */
export function VariablePicker({
  catalog,
  withSlots,
  onPick,
}: VariablePickerProps) {
  const [open, setOpen] = useState(false);
  const pick = (text: string) => {
    onPick(text);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!catalog}
          className="h-9 md:h-8"
        >
          <Braces />
          Inserir variável
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Command>
          <CommandInput placeholder="Buscar variável…" />
          <CommandList className="max-h-72">
            <CommandEmpty>Nenhuma variável encontrada.</CommandEmpty>
            {withSlots && (catalog?.slots.length ?? 0) > 0 && (
              <CommandGroup heading="Blocos">
                {catalog?.slots.map((slot) => (
                  <CommandItem
                    key={slot.key}
                    value={`${slot.label} ${slot.key}`}
                    onSelect={() => pick(`{{{${slot.key}}}}`)}
                  >
                    <Text inline size={null} className="flex-1">
                      {slot.label}
                    </Text>
                    <Text inline size="xs" tone="muted" mono>
                      {`{{{${slot.key}}}}`}
                    </Text>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {catalog?.groups.map((group) => (
              <CommandGroup key={group.key} heading={group.label}>
                {[...group.variables, ...group.rawVariables].map((variable) => (
                  <CommandItem
                    key={variable.key}
                    value={`${group.label} ${variable.label} ${variable.key}`}
                    onSelect={() => pick(`{{${variable.key}}}`)}
                  >
                    <Text
                      inline
                      size={null}
                      className="min-w-0 flex-1 truncate"
                    >
                      {variable.label}
                    </Text>
                    <Text inline size="xs" tone="muted" mono truncate>
                      {variable.example ?? variable.key}
                    </Text>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
