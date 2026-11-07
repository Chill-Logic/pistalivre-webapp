import { Pencil, Store } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import { QueryError } from "@/components/organisms/query-error";
import { SupplierDeleteButton } from "@/components/organisms/supplier-delete-button";
import {
  SupplierSummary,
  SupplierSummarySkeleton,
} from "@/components/organisms/supplier-summary";
import { SupplierVehiclesCard } from "@/components/organisms/supplier-vehicles-card";
import { SupplierDetailLayout } from "@/components/templates/supplier-detail-layout";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useSupplier } from "@/hooks/api/gestao/suppliers/useSupplier";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function SupplierDetailPage() {
  const { id = "" } = useParams();
  const supplier = useSupplier(id);
  const backTo = useBackToList(ROUTES.suppliers);

  return (
    <Box className="space-y-4">
      <Box className="flex items-center justify-between gap-2">
        <BackLink to={backTo} label="Fornecedores" />
        {supplier.data && (
          <Box className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.editSupplier(supplier.data.id)}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <SupplierDeleteButton
              supplierId={supplier.data.id}
              name={supplier.data.name}
            />
          </Box>
        )}
      </Box>
      {supplier.isPending && (
        <SkeletonRegion label="Carregando fornecedor…">
          <SupplierDetailLayout
            summary={<SupplierSummarySkeleton />}
            vehicles={null}
            documents={<DocumentsCardSkeleton />}
          />
        </SkeletonRegion>
      )}
      {supplier.isError &&
        (isNotFound(supplier.error) ? (
          <EmptyState
            icon={Store}
            title="Fornecedor não encontrado"
            description="Ele pode ter sido excluído ou o endereço está errado."
          />
        ) : (
          <QueryError
            error={supplier.error}
            onRetry={() => supplier.refetch()}
          />
        ))}
      {supplier.data && (
        <SupplierDetailLayout
          summary={<SupplierSummary supplier={supplier.data} />}
          vehicles={
            supplier.data.scope === "VEHICLE" ? (
              <SupplierVehiclesCard
                supplierId={supplier.data.id}
                baseAmount={supplier.data.monthlyAmount}
                links={supplier.data.vehicles}
              />
            ) : null
          }
          documents={<DocumentsCard documents={supplier.data.documents} />}
        />
      )}
    </Box>
  );
}
