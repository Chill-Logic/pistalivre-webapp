import { FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  ContractTemplatePreview,
  ContractTemplatePreviewSkeleton,
} from "@/components/organisms/contract-template-preview";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useContractTemplate } from "@/hooks/api/gestao/templates/useContractTemplate";

export function ContractTemplateDetailPage() {
  const { id = "" } = useParams();
  const template = useContractTemplate(id);

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.models} label="Modelos" />
      {template.isPending && (
        <SkeletonRegion label="Carregando modelo…">
          <ContractTemplatePreviewSkeleton />
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
      {template.data && <ContractTemplatePreview template={template.data} />}
    </Box>
  );
}
