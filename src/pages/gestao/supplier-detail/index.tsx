import { Store } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import { QueryError } from "@/components/organisms/query-error";
import {
  SupplierSummary,
  SupplierSummarySkeleton,
} from "@/components/organisms/supplier-summary";
import { SupplierVehiclesCard } from "@/components/organisms/supplier-vehicles-card";
import { SupplierDetailLayout } from "@/components/templates/supplier-detail-layout";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useSupplier } from "@/hooks/api/gestao/suppliers/useSupplier";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function SupplierDetailPage() {
  const { id = "" } = useParams();
  const supplier = useSupplier(id);
  const backTo = useBackToList(ROUTES.suppliers);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Fornecedores" />
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
              <SupplierVehiclesCard links={supplier.data.vehicles} />
            ) : null
          }
          documents={<DocumentsCard documents={supplier.data.documents} />}
        />
      )}
    </Box>
  );
}
