import { Check, ChevronsUpDown } from "lucide-react";
import { useId, useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Command,
  CommandEmpty,
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
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

export type RemoteOption = { value: string; label: string; detail?: string };

type RemoteComboboxProps = {
  label: string;
  /** Selected id. */
  value: string;
  /** Label of the selected option (known even before searching). */
  selectedLabel?: string;
  options: RemoteOption[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onChange: (option: RemoteOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
};

/**
 * Pick one record from a server-side search (customers, vehicles…): the list
 * is never loaded whole. Filtering is the API's job, not cmdk's.
 */
export function RemoteCombobox({
  label,
  value,
  selectedLabel,
  options,
  isLoading,
  search,
  onSearchChange,
  onChange,
  placeholder = "Selecione",
  searchPlaceholder = "Buscar…",
  error,
  disabled = false,
}: RemoteComboboxProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;

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
              {selectedLabel || placeholder}
            </Text>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              {isLoading ? (
                <Box className="flex justify-center py-6">
                  <Spinner />
                </Box>
              ) : (
                <CommandEmpty>Nada encontrado.</CommandEmpty>
              )}
              {!isLoading &&
                options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        option.value === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <Box className="min-w-0">
                      <Text inline size={null} className="block truncate">
                        {option.label}
                      </Text>
                      {option.detail && (
                        <Text
                          inline
                          size="xs"
                          tone="muted"
                          className="block truncate"
                        >
                          {option.detail}
                        </Text>
                      )}
                    </Box>
                  </CommandItem>
                ))}
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
