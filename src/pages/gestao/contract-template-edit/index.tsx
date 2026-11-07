import { FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  ContractTemplateForm,
  ContractTemplateFormSkeleton,
} from "@/components/organisms/contract-template-form";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useContractTemplate } from "@/hooks/api/gestao/templates/useContractTemplate";

export function ContractTemplateEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const template = useContractTemplate(id);
  const detailUrl = routeTo.contractTemplate(id);

  return (
    <Box className="space-y-4">
      <BackLink to={detailUrl} label={template.data?.name ?? "Modelo"} />
      <PageHeader title="Editar modelo de contrato" />
      {template.isPending && (
        <SkeletonRegion label="Carregando modelo…">
          <ContractTemplateFormSkeleton />
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
        <ContractTemplateForm
          key={`${template.data.id}-${template.data.version}`}
          template={template.data}
          cancelTo={detailUrl}
          onSaved={() => navigate(detailUrl, { replace: true })}
        />
      )}
    </Box>
  );
}
