import { TabbedSection } from "@/components/templates/tabbed-section";
import { INTEGRATION_TABS } from "@/constants/integrations";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

/** Layout of /gestao/integracoes: Conectar for everyone; Permissões and Aplicativos for the admin. */
export function IntegrationsSectionPage({ preload }: { preload?: (() => unknown)[] }) {
  const { isAdmin } = useUserPermissions();
  return (
    <TabbedSection
      title="Integrações"
      tabs={INTEGRATION_TABS.filter((tab) => isAdmin || !tab.adminOnly)}
      label="Seções das integrações"
      preload={preload}
    />
  );
}
