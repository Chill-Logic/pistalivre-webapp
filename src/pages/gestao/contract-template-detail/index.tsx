import { FileText, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  ContractTemplatePreview,
  ContractTemplatePreviewSkeleton,
} from "@/components/organisms/contract-template-preview";
import { ContractTemplateDeleteButton } from "@/components/organisms/contract-template-delete-button";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useContractTemplate } from "@/hooks/api/gestao/templates/useContractTemplate";

export function ContractTemplateDetailPage() {
  const { id = "" } = useParams();
  const template = useContractTemplate(id);

  return (
    <Box className="space-y-4">
      <Box className="flex items-center justify-between gap-2">
        <BackLink to={ROUTES.models} label="Modelos" />
        {template.data && (
          <Box className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.editContractTemplate(template.data.id)}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <ContractTemplateDeleteButton
              templateId={template.data.id}
              name={template.data.name}
            />
          </Box>
        )}
      </Box>
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
