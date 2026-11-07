import { TabbedSection } from "@/components/templates/tabbed-section";
import { FINANCE_TABS } from "@/constants/finance";

/** Layout of /gestao/financeiro: overview, debts and statement tabs. */
export function FinanceSectionPage({
  preload,
}: {
  preload?: (() => unknown)[];
}) {
  return (
    <TabbedSection
      title="Financeiro"
      tabs={FINANCE_TABS}
      label="Seções do financeiro"
      preload={preload}
    />
  );
}
