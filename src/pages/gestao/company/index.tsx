import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  CompanySummary,
  CompanySummarySkeleton,
} from "@/components/organisms/company-summary";
import { CompanyIntegrations } from "@/components/organisms/company-integrations";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import {
  ListCardSkeleton,
  ListRowSkeleton,
} from "@/components/organisms/list-card";
import { queryKeys } from "@/constants/query-keys";
import { QueryError } from "@/components/organisms/query-error";
import { CompanyLayout } from "@/components/templates/company-layout";
import { useCompany } from "@/hooks/api/gestao/company/useCompany";

export function CompanyPage() {
  const company = useCompany();

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Empresa" />
      {company.isPending && (
        <SkeletonRegion label="Carregando empresa…">
          <CompanyLayout
            summary={<CompanySummarySkeleton />}
            integrations={
              <ListCardSkeleton rows={3} row={<ListRowSkeleton />} />
            }
            documents={<DocumentsCardSkeleton />}
          />
        </SkeletonRegion>
      )}
      {company.isError && (
        <QueryError error={company.error} onRetry={() => company.refetch()} />
      )}
      {company.data && (
        <CompanyLayout
          summary={<CompanySummary company={company.data} />}
          integrations={
            <CompanyIntegrations integrations={company.data.integrations} />
          }
          documents={
            <DocumentsCard
              documents={company.data.documents}
              manage={{
                owner: { type: "COMPANY", id: company.data.id },
                invalidate: queryKeys.company.all,
              }}
            />
          }
        />
      )}
    </Box>
  );
}
