import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  CompanyForm,
  CompanyFormSkeleton,
} from "@/components/organisms/company-form";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES } from "@/constants/routes";
import { useCompany } from "@/hooks/api/gestao/company/useCompany";

export function CompanyEditPage() {
  const navigate = useNavigate();
  const company = useCompany();

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.company} label="Empresa" />
      <PageHeader title="Editar empresa" />
      {company.isPending && (
        <SkeletonRegion label="Carregando empresa…">
          <CompanyFormSkeleton />
        </SkeletonRegion>
      )}
      {company.isError && (
        <QueryError error={company.error} onRetry={() => company.refetch()} />
      )}
      {company.data && (
        <CompanyForm
          key={company.data.id}
          company={company.data}
          cancelTo={ROUTES.company}
          onSaved={() => navigate(ROUTES.company, { replace: true })}
        />
      )}
    </Box>
  );
}
