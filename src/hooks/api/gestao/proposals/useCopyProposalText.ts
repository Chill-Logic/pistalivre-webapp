import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { useCopy } from "@/hooks/ui/useCopy";
import { companyService } from "@/services/api/gestao/company.service";
import { proposalsService } from "@/services/api/gestao/proposals.service";
import { proposalHtmlToText } from "@/utils/proposal-text";

/** The HTML at hand (detail, lead, composer) or the id to fetch it by (lists). */
export type ProposalTextSource = { html: string } | { proposalId: string };

/**
 * "Copiar texto": the proposal as a WhatsApp message, without the line of the
 * company's legal name (GET /company, cached). A list item has no HTML, so it
 * is fetched once (GET /proposals/:id, the detail cache).
 */
export function useCopyProposalText() {
  const queryClient = useQueryClient();
  const copy = useCopy();
  return useMutation({
    mutationFn: async (source: ProposalTextSource) => {
      const [company, html] = await Promise.all([
        queryClient
          .fetchQuery({
            queryKey: queryKeys.company.all,
            queryFn: companyService.get,
            staleTime: 5 * 60_000,
          })
          .catch(() => null),
        "html" in source
          ? source.html
          : queryClient
              .fetchQuery({
                queryKey: queryKeys.proposals.detail(source.proposalId),
                queryFn: () => proposalsService.get(source.proposalId),
              })
              .then((proposal) => proposal.renderedHtml),
      ]);
      await copy(
        proposalHtmlToText(html, company?.legalName ?? ""),
        "Texto da proposta copiado",
      );
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
