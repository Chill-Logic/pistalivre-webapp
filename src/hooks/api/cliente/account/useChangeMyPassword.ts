import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authToken } from "@/helpers/auth-token";
import { accountService } from "@/services/api/cliente/account.service";

/** The old token is revoked by the change: keep the new one. */
export function useChangeMyPassword() {
  return useMutation({
    mutationFn: accountService.changePassword,
    onSuccess: (token) => {
      authToken.set(token);
      toast.success("Senha alterada");
    },
  });
}
