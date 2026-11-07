import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useId, useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/atoms/command";
import { Label } from "@/components/atoms/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import { Text } from "@/components/atoms/text";
import { canCreateOption, sameText } from "@/helpers/combobox";
import type { SelectOption } from "@/helpers/select";
import { cn } from "@/utils/cn";

type CreatableComboboxProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Only digits may be typed (e.g. year). */
  numeric?: boolean;
  error?: string;
  disabled?: boolean;
};

/**
 * Pick from the list or type a new value ("Usar “X”"). The value is the
 * option's LABEL — the API find-or-creates brands/models by name.
 */
export function CreatableCombobox({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecione",
  searchPlaceholder = "Buscar ou digitar…",
  numeric = false,
  error,
  disabled = false,
}: CreatableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const id = useId();
  const errorId = `${id}-error`;

  const choose = (next: string) => {
    onChange(next.trim());
    setQuery("");
    setOpen(false);
  };

  return (
    <Box className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            disabled={disabled}
            className={cn(
              "w-full justify-between bg-card px-3 text-base font-normal md:text-sm",
              !value && "text-muted-foreground",
              error && "border-destructive",
            )}
          >
            <Text inline size={null} truncate>
              {value || placeholder}
            </Text>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Command>
            <CommandInput
              value={query}
              onValueChange={(next) =>
                setQuery(numeric ? next.replace(/\D/g, "") : next)
              }
              inputMode={numeric ? "numeric" : undefined}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              <CommandEmpty>Nada encontrado.</CommandEmpty>
              {canCreateOption(query, options) && (
                <CommandGroup>
                  <CommandItem
                    value={`__create__${query}`}
                    onSelect={() => choose(query)}
                  >
                    <Plus className="size-4" />
                    Usar “{query.trim()}”
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => choose(option.label)}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        sameText(option.label, value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <Text id={errorId} tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
