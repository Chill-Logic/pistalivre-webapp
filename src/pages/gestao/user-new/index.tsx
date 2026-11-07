import { UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { UserForm } from "@/components/organisms/user-form";
import { ROUTES, routeTo } from "@/constants/routes";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

/** Only admins create accounts (the API answers 403 to agents). */
export function UserNewPage() {
  const navigate = useNavigate();
  const { canCreate } = useUserPermissions();

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.users} label="Usuários" />
      <PageHeader title="Novo usuário" />
      {canCreate ? (
        <UserForm
          canEditRole
          cancelTo={ROUTES.users}
          onSaved={(user) => navigate(routeTo.user(user.id), { replace: true })}
        />
      ) : (
        <EmptyState
          icon={UserCog}
          title="Sem permissão"
          description="Só administradores criam usuários."
        />
      )}
    </Box>
  );
}
