import { Pencil, UserCog } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { UserDeleteButton } from "@/components/organisms/user-delete-button";
import { UserPasswordDialog } from "@/components/organisms/user-password-dialog";
import { QueryError } from "@/components/organisms/query-error";
import {
  UserSummary,
  UserSummarySkeleton,
} from "@/components/organisms/user-summary";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useUser } from "@/hooks/api/gestao/users/useUser";
import { useBackToList } from "@/hooks/ui/useBackToList";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

export function UserDetailPage() {
  const { id = "" } = useParams();
  const user = useUser(id);
  const backTo = useBackToList(ROUTES.users);
  const can = useUserPermissions(id);

  return (
    <Box className="space-y-4">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <BackLink to={backTo} label="Usuários" />
        {user.data && (
          <Box className="flex flex-wrap gap-1">
            {can.canEdit && (
              <Button asChild variant="ghost" size="sm">
                <Link to={routeTo.editUser(user.data.id)}>
                  <Pencil />
                  Editar
                </Link>
              </Button>
            )}
            {can.canChangePassword && (
              <UserPasswordDialog
                userId={user.data.id}
                userName={user.data.name}
                isSelf={can.isSelf}
              />
            )}
            {can.canDelete && (
              <UserDeleteButton
                userId={user.data.id}
                userName={user.data.name}
                isSelf={can.isSelf}
              />
            )}
          </Box>
        )}
      </Box>
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
