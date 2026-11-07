import { LayoutGrid, Table2 } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import type { ListView } from "@/constants/pagination";
import { cn } from "@/utils/cn";

const OPTIONS: { value: ListView; label: string; icon: typeof Table2 }[] = [
  { value: "lista", label: "Lista", icon: LayoutGrid },
  { value: "tabela", label: "Tabela", icon: Table2 },
];

type ViewToggleProps = {
  view: ListView;
  onChange: (view: ListView) => void;
};

/** Segmented "Lista | Tabela" switch; the thumb slides to the choice. */
export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const index = OPTIONS.findIndex((option) => option.value === view);

  return (
    <Box
      role="group"
      aria-label="Visualização"
      className="relative inline-flex shrink-0 rounded-md border bg-muted/40 p-0.5"
    >
      <Box
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded bg-card shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          aria-pressed={view === value}
          onClick={() => onChange(value)}
          className={cn(
            "relative z-10 h-9 flex-1 gap-1.5 px-3 hover:bg-transparent md:h-8",
            view === value ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <Icon />
          {label}
        </Button>
      ))}
    </Box>
  );
}
