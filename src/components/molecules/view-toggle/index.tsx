import { LayoutGrid, Table2 } from "lucide-react";
import { SegmentedControl } from "@/components/atoms/segmented-control";
import type { ReactNode } from "react";
import type { ListView } from "@/constants/pagination";

const OPTIONS: { value: ListView; label: ReactNode }[] = [
  {
    value: "lista",
    label: (
      <>
        <LayoutGrid aria-hidden />
        Lista
      </>
    ),
  },
  {
    value: "tabela",
    label: (
      <>
        <Table2 aria-hidden />
        Tabela
      </>
    ),
  },
];

type ViewToggleProps = {
  view: ListView;
  onChange: (view: ListView) => void;
};

/**
 * Segmented "Lista | Tabela" switch; the thumb slides to the choice.
 * Desktop only: the phone always shows cards.
 */
export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <SegmentedControl
      aria-label="Visualização"
      size="sm"
      value={view}
      onValueChange={onChange}
      options={OPTIONS}
      className="hidden w-auto shrink-0 md:flex"
    />
  );
}
