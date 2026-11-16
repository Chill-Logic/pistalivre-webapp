import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TEMPLATE_PERIOD_LABEL } from "@/constants/asaas-notifications";
import { queryKeys } from "@/constants/query-keys";
import { asaasNotificationsService } from "@/services/api/gestao/asaas-notifications.service";
import type {
  NotificationSlots,
  TemplatePeriod,
} from "@/types/asaas-notification-template";

const templatesKey = ["asaas-notification-templates"] as const;
const customerKey = (customerId: string) =>
  [...queryKeys.customers.all, "notifications", customerId] as const;

/** The three templates (weekly, monthly, daily). */
export function useNotificationTemplates() {
  return useQuery({
    queryKey: templatesKey,
    queryFn: asaasNotificationsService.templates,
  });
}

export function useSaveNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { period: TemplatePeriod; slots: NotificationSlots }) =>
      asaasNotificationsService.saveTemplate(input.period, input.slots),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: templatesKey });
      toast.success(
        `Modelo ${TEMPLATE_PERIOD_LABEL[input.period].toLowerCase()} salvo`,
      );
    },
  });
}

/** The customer's setting at Asaas (read live: no refetch on focus). */
export function useCustomerNotificationSlots(customerId: string) {
  return useQuery({
    queryKey: customerKey(customerId),
    queryFn: () => asaasNotificationsService.customer(customerId),
    refetchOnWindowFocus: false,
  });
}

export function useSaveCustomerNotificationSlots(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slots: Partial<NotificationSlots>) =>
      asaasNotificationsService.saveCustomer(customerId, slots),
    onSuccess: (view) => {
      queryClient.setQueryData(customerKey(customerId), view);
      toast.success("Notificações salvas no Asaas");
    },
  });
}

/** "Desligar todas as notificações" / "Religar" (one switch at Asaas). */
export function useSetAllNotificationsDisabled(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (disabled: boolean) =>
      asaasNotificationsService.setAllDisabled(customerId, disabled),
    onSuccess: (view) => {
      queryClient.setQueryData(customerKey(customerId), view);
      toast.success(
        view.allDisabled
          ? "Notificações desligadas no Asaas"
          : "Notificações religadas no Asaas",
      );
    },
  });
}

export function useApplyNotificationTemplate(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (period?: TemplatePeriod) =>
      asaasNotificationsService.applyTemplate(customerId, period),
    onSuccess: (view) => {
      queryClient.setQueryData(customerKey(customerId), view);
      toast.success(
        view.applied
          ? `Modelo ${TEMPLATE_PERIOD_LABEL[view.applied].toLowerCase()} aplicado no Asaas`
          : "Modelo aplicado no Asaas",
      );
    },
  });
}
