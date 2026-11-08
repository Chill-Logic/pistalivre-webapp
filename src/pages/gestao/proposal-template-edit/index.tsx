import { FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  ProposalTemplateForm,
  ProposalTemplateFormSkeleton,
} from "@/components/organisms/proposal-template-form";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useProposalTemplate } from "@/hooks/api/gestao/templates/useProposalTemplate";

export function ProposalTemplateEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const template = useProposalTemplate(id);

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.modelsProposals} label="Modelos de proposta" />
      <PageHeader title="Editar modelo de proposta" />
      {template.isPending && (
        <SkeletonRegion label="Carregando modelo…">
          <ProposalTemplateFormSkeleton />
        </SkeletonRegion>
      )}
      {template.isError &&
        (isNotFound(template.error) ? (
          <EmptyState icon={FileText} title="Modelo não encontrado" />
        ) : (
          <QueryError
            error={template.error}
            onRetry={() => template.refetch()}
          />
        ))}
      {template.data && (
        <ProposalTemplateForm
          key={`${template.data.id}-${template.data.version}`}
          template={template.data}
          cancelTo={ROUTES.modelsProposals}
          onSaved={() => navigate(ROUTES.modelsProposals, { replace: true })}
        />
      )}
    </Box>
  );
}
