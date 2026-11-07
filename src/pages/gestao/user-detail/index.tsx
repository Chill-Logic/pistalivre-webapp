import { UserCog } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import {
  UserSummary,
  UserSummarySkeleton,
} from "@/components/organisms/user-summary";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useUser } from "@/hooks/api/gestao/users/useUser";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function UserDetailPage() {
  const { id = "" } = useParams();
  const user = useUser(id);
  const backTo = useBackToList(ROUTES.users);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Usuários" />
      {user.isPending && (
        <SkeletonRegion label="Carregando usuário…">
          <UserSummarySkeleton />
        </SkeletonRegion>
      )}
      {user.isError &&
        (isNotFound(user.error) ? (
          <EmptyState icon={UserCog} title="Usuário não encontrado" />
        ) : (
          <QueryError error={user.error} onRetry={() => user.refetch()} />
        ))}
      {user.data && <UserSummary user={user.data} />}
    </Box>
  );
}
