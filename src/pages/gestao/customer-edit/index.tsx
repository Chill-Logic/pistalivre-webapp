import { Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  CustomerForm,
  CustomerFormSkeleton,
} from "@/components/organisms/customer-form";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useCustomer } from "@/hooks/api/gestao/customers/useCustomer";

export function CustomerEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const customer = useCustomer(id);
  const detailUrl = routeTo.customer(id);

  return (
    <Box className="space-y-4">
      <BackLink to={detailUrl} label={customer.data?.name ?? "Cliente"} />
      <PageHeader title="Editar cliente" />
      {customer.isPending && (
        <SkeletonRegion label="Carregando cliente…">
          <CustomerFormSkeleton />
        </SkeletonRegion>
      )}
      {customer.isError &&
        (isNotFound(customer.error) ? (
          <EmptyState icon={Users} title="Cliente não encontrado" />
        ) : (
          <QueryError
            error={customer.error}
            onRetry={() => customer.refetch()}
          />
        ))}
      {customer.data && (
        <CustomerForm
          key={customer.data.id}
          customer={customer.data}
          cancelTo={detailUrl}
          onSaved={() => navigate(detailUrl, { replace: true })}
        />
      )}
    </Box>
  );
}
