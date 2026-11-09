import { ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { AiClientsAdmin } from "@/components/organisms/ai-clients-admin";
import { AiMyAccessSkeleton } from "@/components/organisms/ai-my-access";
import { QueryError } from "@/components/organisms/query-error";
import { useAiClients } from "@/hooks/api/gestao/ai/useAi";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

/** Integrações › Aplicativos (admin): connected apps and who authorized them. */
export function IntegrationsAppsPage() {
  const { isAdmin } = useUserPermissions();
  const clients = useAiClients();
  if (!isAdmin) return <EmptyState icon={ShieldAlert} title="Só administradores" />;
  if (clients.isError) return <QueryError error={clients.error} onRetry={() => clients.refetch()} />;
  if (!clients.data) {
    return (
      <SkeletonRegion label="Carregando aplicativos…">
        <AiMyAccessSkeleton />
      </SkeletonRegion>
    );
  }
  return <AiClientsAdmin clients={clients.data} />;
}
