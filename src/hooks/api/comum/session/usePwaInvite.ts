import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { sessionService } from "@/services/api/comum/session.service";
import type { AuthUser, PwaUsage } from "@/types/auth";

const EMPTY_PWA: PwaUsage = {
  firstUsedAt: null,
  lastUsedAt: null,
  installedAt: null,
  inviteDismissedAt: null,
};

/**
 * "Agora não" / "Instalar" on the install invite. Optimistic on the
 * /auth/me cache (the invite hides at once), rolled back on error.
 */
function usePwaInviteMutation(
  request: () => Promise<PwaUsage>,
  field: "inviteDismissedAt" | "installedAt",
) {
  const queryClient = useQueryClient();
  const key = queryKeys.auth.me();
  const setPwa = (pwa: PwaUsage) =>
    queryClient.setQueryData<AuthUser>(key, (user) =>
      user ? { ...user, pwa } : user,
    );

  return useMutation({
    mutationFn: request,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<AuthUser>(key);
      setPwa({
        ...(previous?.pwa ?? EMPTY_PWA),
        [field]: new Date().toISOString(),
      });
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: setPwa,
  });
}

export function useDismissPwaInvite() {
  return usePwaInviteMutation(
    sessionService.dismissPwaInvite,
    "inviteDismissedAt",
  );
}

export function useMarkPwaInstalled() {
  return usePwaInviteMutation(sessionService.markPwaInstalled, "installedAt");
}
