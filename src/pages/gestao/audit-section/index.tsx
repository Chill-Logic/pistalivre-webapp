import { ShieldAlert } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { TabbedSection } from "@/components/templates/tabbed-section";
import { AUDIT_TABS } from "@/constants/integrations";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

/** Layout of /gestao/auditoria (admin only): Eventos and Lacunas. */
export function AuditSectionPage({ preload }: { preload?: (() => unknown)[] }) {
  const { isAdmin } = useUserPermissions();
  if (!isAdmin) {
    return (
      <Box className="space-y-4 md:space-y-6">
        <PageHeader title="Auditoria" />
        <EmptyState
          icon={ShieldAlert}
          title="Só administradores"
          description="A auditoria é visível só para administradores."
        />
      </Box>
    );
  }
  return (
    <TabbedSection
      title="Auditoria"
      tabs={AUDIT_TABS}
      label="Seções da auditoria"
      preload={preload}
    />
  );
}
