import { ShieldAlert } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { AiMyAccessSkeleton } from "@/components/organisms/ai-my-access";
import { AiRolePermissions } from "@/components/organisms/ai-role-permissions";
import { AiUserPermissions } from "@/components/organisms/ai-user-permissions";
import { QueryError } from "@/components/organisms/query-error";
import { useAiPermissions } from "@/hooks/api/gestao/ai/useAi";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

/** Integrações › Permissões (admin): tools per role and per person. */
export function IntegrationsPermissionsPage() {
  const { isAdmin } = useUserPermissions();
  const permissions = useAiPermissions();
  if (!isAdmin) return <EmptyState icon={ShieldAlert} title="Só administradores" />;
  if (permissions.isError) return <QueryError error={permissions.error} onRetry={() => permissions.refetch()} />;
  if (!permissions.data) {
    return (
      <SkeletonRegion label="Carregando permissões…">
        <AiMyAccessSkeleton />
      </SkeletonRegion>
    );
  }
  return (
    <Box className="space-y-4 md:space-y-6">
      <AiRolePermissions key={JSON.stringify(permissions.data.roles)} data={permissions.data} />
      <AiUserPermissions data={permissions.data} />
    </Box>
  );
}
