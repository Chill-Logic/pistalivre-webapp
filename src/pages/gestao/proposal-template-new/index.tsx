import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { ProposalTemplateForm } from "@/components/organisms/proposal-template-form";
import { ROUTES } from "@/constants/routes";

export function ProposalTemplateNewPage() {
  const navigate = useNavigate();
  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.modelsProposals} label="Modelos de proposta" />
      <PageHeader title="Novo modelo de proposta" />
      <ProposalTemplateForm
        cancelTo={ROUTES.modelsProposals}
        onSaved={() => navigate(ROUTES.modelsProposals, { replace: true })}
      />
    </Box>
  );
}
