import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { usePagedList } from "@/hooks/ui/usePagedList";
import { aiService } from "@/services/api/gestao/ai.service";
import type { AiAuditFilters, AiPermissions } from "@/types/ai";

/** What this person may use with the AI and the apps they authorized. */
export function useAiMe() {
  return useQuery({ queryKey: queryKeys.ai.me(), queryFn: aiService.me });
}

/** The editor's chat shows only with the AI configured and chat tools granted. */
export function useAiChatAvailable() {
  const me = useAiMe();
  return Boolean(me.data?.aiEnabled && me.data.chatTools.length > 0);
}

/** One message to the editor's agent (nothing is saved). */
export function useAiChat() {
  return useMutation({ mutationFn: aiService.chat });
}

/** Revokes an app's authorization (own, or anyone's for the admin). */
export function useRevokeAiGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiService.revokeGrant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ai.all });
      toast.success("Acesso revogado");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useAiConsent(query: string) {
  return useQuery({
    queryKey: queryKeys.ai.consent(query),
    queryFn: () => aiService.consent(query),
    retry: false,
  });
}

export function useAiPermissions() {
  return useQuery({ queryKey: queryKeys.ai.permissions(), queryFn: aiService.permissions });
}

/** Saving a role or a person: the overview comes back and replaces the cache. */
export function useSaveAiPermissions() {
  const queryClient = useQueryClient();
  const store = (data: AiPermissions) => {
    queryClient.setQueryData(queryKeys.ai.permissions(), data);
    queryClient.invalidateQueries({ queryKey: queryKeys.ai.me() });
  };
  return {
    role: useMutation({
      mutationFn: ({ role, tools }: { role: string; tools: string[] }) => aiService.setRoleTools(role, tools),
      onSuccess: (data) => {
        store(data);
        toast.success("Permissões do papel salvas");
      },
      onError: (error) => toast.error(errorMessage(error)),
    }),
    user: useMutation({
      mutationFn: ({ userId, allow, deny }: { userId: string; allow: string[]; deny: string[] }) =>
        aiService.setUserOverrides(userId, { allow, deny }),
      onSuccess: (data) => {
        store(data);
        toast.success("Permissões da pessoa salvas");
      },
      onError: (error) => toast.error(errorMessage(error)),
    }),
  };
}

export function useAiClients() {
  return useQuery({ queryKey: queryKeys.ai.clients(), queryFn: aiService.clients });
}

export function useBlockAiClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) => aiService.setClientBlocked(id, blocked),
    onSuccess: (items, { blocked }) => {
      queryClient.setQueryData(queryKeys.ai.clients(), items);
      toast.success(blocked ? "Aplicativo bloqueado" : "Aplicativo desbloqueado");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/** The audit: pages on the desktop, 10 by 10 on the phone. */
export function useAiAudit(filters: AiAuditFilters, isDesktop: boolean) {
  return usePagedList({
    baseKey: queryKeys.ai.audit(),
    filters,
    fetch: (current) => aiService.audit(current),
    isDesktop,
  });
}

export function useAiAuditEntry(id: string | null) {
  return useQuery({
    queryKey: queryKeys.ai.auditEntry(id ?? ""),
    queryFn: () => aiService.auditEntry(id ?? ""),
    enabled: Boolean(id),
  });
}
