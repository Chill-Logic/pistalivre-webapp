import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { customerSettingsService } from "@/services/api/gestao/customer-settings.service";
import type { AsaasNotification } from "@/types/customer-settings";

const notificationsKey = (customerId: string) =>
  [...queryKeys.customers.all, "notifications", customerId] as const;

/**
 * What Asaas warns this customer about, and through which channels. It is
 * read from Asaas on every load, so it does not refetch on focus.
 */
export function useCustomerNotifications(customerId: string) {
  return useQuery({
    queryKey: notificationsKey(customerId),
    queryFn: () => customerSettingsService.notifications(customerId),
    refetchOnWindowFocus: false,
  });
}

/** Rewrites the whole set at Asaas; the answer becomes the new "clean". */
export function useSaveCustomerNotifications(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: AsaasNotification[]) =>
      customerSettingsService.saveNotifications(customerId, items),
    onSuccess: (view) => {
      queryClient.setQueryData(notificationsKey(customerId), view);
      toast.success("Notificações salvas no Asaas");
    },
  });
}
