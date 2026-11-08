import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { STATEMENT_MODES } from "@/constants/rent-statement";
import type { RentStatementMode } from "@/types/rent-statement";
import { cn } from "@/utils/cn";

type StatementModeToggleProps = {
  mode: RentStatementMode;
  onChange: (mode: RentStatementMode) => void;
};

/** "Saldo devedor | Dia a dia": the two statement models, side by side. */
export function StatementModeToggle({
  mode,
  onChange,
}: StatementModeToggleProps) {
  const index = STATEMENT_MODES.findIndex((item) => item.mode === mode);

  return (
    <Box
      role="group"
      aria-label="Modelo do extrato"
      className="relative inline-flex w-full shrink-0 rounded-md border bg-muted/40 p-0.5 sm:w-auto"
    >
      <Box
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded bg-card shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {STATEMENT_MODES.map((item) => (
        <Button
          key={item.mode}
          variant="ghost"
          size="sm"
          aria-pressed={item.mode === mode}
          onClick={() => onChange(item.mode)}
          className={cn(
            "relative z-10 h-9 flex-1 px-3 hover:bg-transparent md:h-8",
            item.mode === mode ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );
}
