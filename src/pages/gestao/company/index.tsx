import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { AiAnchor } from "@/components/atoms/ai-anchor";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  CompanySummary,
  CompanySummarySkeleton,
} from "@/components/organisms/company-summary";
import {
  CompanyIntegrations,
  CompanyIntegrationsSkeleton,
} from "@/components/organisms/company-integrations";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { QueryError } from "@/components/organisms/query-error";
import { CompanyLayout } from "@/components/templates/company-layout";
import { useCompany } from "@/hooks/api/gestao/company/useCompany";
import { useCompanyIntegrations } from "@/hooks/api/gestao/company/useCompanyIntegrations";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

export function CompanyPage() {
  const company = useCompany();
  const integrations = useCompanyIntegrations();
  const { isAdmin } = useUserPermissions();

  const integrationsCard = (
    <>
      {integrations.isPending && (
        <SkeletonRegion label="Carregando integrações…">
          <CompanyIntegrationsSkeleton canManage={isAdmin} />
        </SkeletonRegion>
      )}
      {integrations.isError && (
        <QueryError
          error={integrations.error}
          onRetry={() => integrations.refetch()}
        />
      )}
      {integrations.data && (
        <CompanyIntegrations
          integrations={integrations.data}
          canManage={isAdmin}
        />
      )}
    </>
  );

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Empresa"
        actions={
          company.data && (
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.companyEdit}>
                <Pencil />
                Editar
              </Link>
            </Button>
          )
        }
      />
      {company.isPending && (
        <SkeletonRegion label="Carregando empresa…">
          <CompanyLayout
            summary={<CompanySummarySkeleton />}
            integrations={<CompanyIntegrationsSkeleton canManage={isAdmin} />}
            documents={<DocumentsCardSkeleton />}
          />
        </SkeletonRegion>
      )}
      {company.isError && (
        <QueryError error={company.error} onRetry={() => company.refetch()} />
      )}
      {company.data && (
        <CompanyLayout
          summary={
            <AiAnchor id="summary">
              <CompanySummary company={company.data} />
            </AiAnchor>
          }
          integrations={integrationsCard}
          documents={
            <AiAnchor id="documents">
              <DocumentsCard
                documents={company.data.documents}
                manage={{
                  owner: { type: "COMPANY", id: company.data.id },
                  invalidate: queryKeys.company.all,
                }}
              />
            </AiAnchor>
          }
        />
      )}
    </Box>
  );
}
