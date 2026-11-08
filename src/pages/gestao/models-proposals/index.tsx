import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  ProposalTemplateList,
  ProposalTemplateListSkeleton,
} from "@/components/organisms/proposal-template-list";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { ROUTES } from "@/constants/routes";
import { useProposalTemplateList } from "@/hooks/api/gestao/templates/useProposalTemplateList";

/** Modelos → Propostas: the drafts shown to a lead before the contract. */
export function ModelsProposalsPage() {
  const templates = useProposalTemplateList();
  return (
    <Box className="space-y-4 md:space-y-6">
      <Box className="flex justify-end">
        <Button asChild>
          <Link to={ROUTES.proposalTemplateNew}>
            <Plus />
            Novo modelo
          </Link>
        </Button>
      </Box>
      <QueryBoundary
        query={templates}
        label="Carregando modelos…"
        skeleton={<ProposalTemplateListSkeleton />}
      >
        {(data) => <ProposalTemplateList templates={data} />}
      </QueryBoundary>
    </Box>
  );
}
