import { Search, X } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";

type NavSearchProps = {
  value: string;
  onChange: (value: string) => void;
  /** Enter: open the first item found. */
  onSubmit: () => void;
};

/** "Buscar no menu": filters as you type; Enter opens the first; Esc clears. */
export function NavSearch({ value, onChange, onSubmit }: NavSearchProps) {
  return (
    <Box className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit();
          } else if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
          }
        }}
        placeholder="Buscar no menu"
        aria-label="Buscar no menu"
        autoComplete="off"
        className="h-9 pl-9 pr-9 md:h-8"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Limpar a busca"
          onClick={() => onChange("")}
          className="absolute right-0.5 top-1/2 size-8 -translate-y-1/2 md:size-7"
        >
          <X />
        </Button>
      )}
    </Box>
  );
}
