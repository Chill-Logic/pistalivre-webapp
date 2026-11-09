import { SegmentedControl } from "@/components/atoms/segmented-control";
import { STATEMENT_MODES } from "@/constants/rent-statement";
import type { RentStatementMode } from "@/types/rent-statement";

type StatementModeToggleProps = {
  mode: RentStatementMode;
  onChange: (mode: RentStatementMode) => void;
};

const OPTIONS = STATEMENT_MODES.map((item) => ({
  value: item.mode,
  label: item.label,
}));

/** "Saldo devedor | Dia a dia": the two statement models, side by side. */
export function StatementModeToggle({
  mode,
  onChange,
}: StatementModeToggleProps) {
  return (
    <SegmentedControl
      aria-label="Modelo do extrato"
      value={mode}
      onValueChange={onChange}
      options={OPTIONS}
      className="shrink-0 sm:w-auto sm:[&>button]:min-w-32"
    />
  );
}
