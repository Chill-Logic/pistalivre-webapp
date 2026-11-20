import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { whatsappService } from "@/services/api/gestao/whatsapp.service";
import type { WhatsAppSettings } from "@/types/whatsapp";

const QR_REFRESH_MS = 5000;

export function useWhatsAppStatus() {
  return useQuery({ queryKey: queryKeys.whatsapp.status(), queryFn: whatsappService.status });
}

/** The QR while the number isn't paired: refreshed every few seconds (it expires in ~40 s). */
export function useWhatsAppQr(enabled: boolean) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.whatsapp.qr(),
    queryFn: async () => {
      const qr = await whatsappService.qr();
      // Paired: the status (number, phone) changed.
      if (qr.connected) void queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.status() });
      return qr;
    },
    enabled,
    refetchInterval: (query) => (query.state.data?.connected ? false : QR_REFRESH_MS),
  });
}

export function useWhatsAppGroups(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.whatsapp.groups(), queryFn: whatsappService.groups, enabled });
}

function useWhatsAppMutation<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  success: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.all });
      toast.success(success);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export const useConnectWhatsApp = () =>
  useWhatsAppMutation(() => whatsappService.connect(), "Ponte ligada ao sistema");

export const useSaveWhatsAppSettings = () =>
  useWhatsAppMutation((settings: WhatsAppSettings) => whatsappService.updateSettings(settings), "Configuração salva");

export const useNewWhatsAppNumber = () =>
  useWhatsAppMutation((logoutPrevious: boolean) => whatsappService.newNumber(logoutPrevious), "Número novo criado: leia o QR com o outro celular");

export const useLogoutWhatsApp = () =>
  useWhatsAppMutation(() => whatsappService.logout(), "Número desconectado");
