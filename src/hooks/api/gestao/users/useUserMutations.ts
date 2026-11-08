import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { useLogout } from "@/hooks/auth/useLogout";
import { usersService } from "@/services/api/gestao/users.service";
import { authToken } from "@/helpers/auth-token";
import type { UserInput, UserPasswordInput } from "@/types/user";

/** Create (no id) or update (id). */
export function useSaveUser(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserInput) =>
      id ? usersService.update(id, input) : usersService.create(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.users.detail(user.id), user);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      // Editing yourself changes the name in the header.
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      toast.success(id ? "Usuário atualizado" : "Usuário criado");
    },
  });
}

/**
 * Your own password: the old token is revoked, so the new one replaces it
 * (otherwise the next request would 401 and log you out).
 */
export function useChangeUserPassword(id: string) {
  return useMutation({
    mutationFn: (input: UserPasswordInput) =>
      usersService.changePassword(id, input),
    onSuccess: (token) => {
      if (token) authToken.set(token);
      toast.success("Senha alterada");
    },
  });
}

/** Deleting your own account ends the session right away. */
export function useDeleteUser(id: string, isSelf: boolean) {
  const queryClient = useQueryClient();
  const logout = useLogout();
  return useMutation({
    mutationFn: () => usersService.remove(id),
    onSuccess: () => {
      if (isSelf) {
        logout();
        return;
      }
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Usuário excluído");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
