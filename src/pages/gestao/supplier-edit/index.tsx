import { Store } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  SupplierForm,
  SupplierFormSkeleton,
} from "@/components/organisms/supplier-form";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useSupplier } from "@/hooks/api/gestao/suppliers/useSupplier";

export function SupplierEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const supplier = useSupplier(id);
  const detailUrl = routeTo.supplier(id);

  return (
    <Box className="space-y-4">
      <BackLink to={detailUrl} label={supplier.data?.name ?? "Custo fixo"} />
      <PageHeader title="Editar custo fixo" />
      {supplier.isPending && (
        <SkeletonRegion label="Carregando custo fixo…">
          <SupplierFormSkeleton />
        </SkeletonRegion>
      )}
      {supplier.isError &&
        (isNotFound(supplier.error) ? (
          <EmptyState icon={Store} title="Custo fixo não encontrado" />
        ) : (
          <QueryError
            error={supplier.error}
            onRetry={() => supplier.refetch()}
          />
        ))}
      {supplier.data && (
        <SupplierForm
          key={supplier.data.id}
          supplier={supplier.data}
          cancelTo={detailUrl}
          onSaved={() => navigate(detailUrl, { replace: true })}
        />
      )}
    </Box>
  );
}
