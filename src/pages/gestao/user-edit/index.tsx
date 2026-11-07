import { UserCog } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { UserForm, UserFormSkeleton } from "@/components/organisms/user-form";
import { routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useUser } from "@/hooks/api/gestao/users/useUser";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

export function UserEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const user = useUser(id);
  const { canEdit, canEditRole } = useUserPermissions(id);
  const detailUrl = routeTo.user(id);

  return (
    <Box className="space-y-4">
      <BackLink to={detailUrl} label={user.data?.name ?? "Usuário"} />
      <PageHeader title="Editar usuário" />
      {!canEdit ? (
        <EmptyState
          icon={UserCog}
          title="Sem permissão"
          description="Agentes só editam a própria conta."
        />
      ) : (
        <>
          {user.isPending && (
            <SkeletonRegion label="Carregando usuário…">
              <UserFormSkeleton />
            </SkeletonRegion>
          )}
          {user.isError &&
            (isNotFound(user.error) ? (
              <EmptyState icon={UserCog} title="Usuário não encontrado" />
            ) : (
              <QueryError error={user.error} onRetry={() => user.refetch()} />
            ))}
          {user.data && (
            <UserForm
              key={user.data.id}
              user={user.data}
              canEditRole={canEditRole}
              cancelTo={detailUrl}
              onSaved={() => navigate(detailUrl, { replace: true })}
            />
          )}
        </>
      )}
    </Box>
  );
}
