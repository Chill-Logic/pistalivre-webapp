import { Search } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Kbd } from "@/components/atoms/kbd";
import { Text } from "@/components/atoms/text";
import { searchPalette } from "@/hooks/ui/useSearchPalette";
import { cn } from "@/utils/cn";

type SearchTriggerProps = {
  /** "bar" = looks like a search box (desktop header, sidebar); "icon" = the magnifier (mobile). */
  layout?: "bar" | "icon";
  /** Before opening (e.g. close the mobile menu sheet). */
  onOpen?: () => void;
  className?: string;
};

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** Opens the universal search (same as Ctrl+K). */
export function SearchTrigger({ layout = "bar", onOpen, className }: SearchTriggerProps) {
  const open = () => {
    onOpen?.();
    searchPalette.open();
  };
  if (layout === "icon") {
    return (
      <Button variant="ghost" size="icon" onClick={open} aria-label="Buscar" title="Buscar" className={className}>
        <Search />
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      onClick={open}
      aria-label="Buscar (Ctrl+K)"
      className={cn("h-9 w-full justify-start gap-2 px-3 font-normal text-muted-foreground md:h-9", className)}
    >
      <Search />
      <Text inline tone="muted" className="flex-1 truncate text-left">
        Buscar…
      </Text>
      <Kbd>{isMac ? "⌘" : "Ctrl"} K</Kbd>
    </Button>
  );
}
