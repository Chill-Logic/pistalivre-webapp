import { TabbedSection } from "@/components/templates/tabbed-section";
import { MODEL_TABS } from "@/constants/models";

/** Layout of /gestao/modelos: Contratos and Vistoria tabs. */
export function ModelsSectionPage({
  preload,
}: {
  preload?: (() => unknown)[];
}) {
  return (
    <TabbedSection
      title="Modelos"
      tabs={MODEL_TABS}
      label="Tipos de modelo"
      preload={preload}
    />
  );
}
