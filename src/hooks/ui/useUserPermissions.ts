import { useSession } from "@/hooks/auth/useSession";

/**
 * What the signed-in staff member may do to a user account — the server's
 * rule, mirrored so the UI doesn't offer what would answer 403:
 * admin manages everyone; an agent only their own account and never their
 * own role (the API ignores it).
 */
export function useUserPermissions(targetId?: string) {
  const { user } = useSession();
  const isAdmin = user?.role === "ADMIN";
  const isSelf = Boolean(targetId) && user?.id === targetId;

  return {
    isAdmin,
    isSelf,
    canCreate: isAdmin,
    canEdit: isAdmin || isSelf,
    canEditRole: isAdmin,
    canChangePassword: isAdmin || isSelf,
    canDelete: isAdmin || isSelf,
  };
}
