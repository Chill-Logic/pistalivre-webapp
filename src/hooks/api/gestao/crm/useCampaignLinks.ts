import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { crmService } from "@/services/api/gestao/crm.service";
import type { CampaignLinkInput } from "@/types/crm";

/** Under `crm.all`, so every CRM invalidation also refreshes the links. */
const campaignLinksKey = [...queryKeys.crm.all, "campaign-links"] as const;

export function useCampaignLinks() {
  return useQuery({
    queryKey: campaignLinksKey,
    queryFn: crmService.campaignLinks,
  });
}

export function useCreateCampaignLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CampaignLinkInput) =>
      crmService.createCampaignLink(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignLinksKey });
      toast.success("Link de campanha criado");
    },
  });
}

/** The leads that came through it stay in the funnel (attribution kept). */
export function useDeleteCampaignLink(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => crmService.removeCampaignLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignLinksKey });
      toast.success("Link apagado");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/** "Simular lead": a sandbox lead through the link (answers its id). */
export function useSimulateCampaignLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => crmService.createTestLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
      toast.success("Lead de teste criado");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
