import { FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  RentalForm,
  RentalFormSkeleton,
} from "@/components/organisms/rental-form";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useRental } from "@/hooks/api/gestao/rentals/useRental";

export function RentalEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const rental = useRental(id);
  const detailUrl = routeTo.rental(id);

  return (
    <Box className="space-y-4">
      <BackLink to={detailUrl} label={rental.data?.code ?? "Locação"} />
      <PageHeader title="Editar locação" />
      {rental.isPending && (
        <SkeletonRegion label="Carregando locação…">
          <RentalFormSkeleton />
        </SkeletonRegion>
      )}
      {rental.isError &&
        (isNotFound(rental.error) ? (
          <EmptyState icon={FileText} title="Locação não encontrada" />
        ) : (
          <QueryError error={rental.error} onRetry={() => rental.refetch()} />
        ))}
      {rental.data && (
        <RentalForm
          key={rental.data.id}
          rental={rental.data}
          cancelTo={detailUrl}
          onSaved={() => navigate(detailUrl, { replace: true })}
        />
      )}
    </Box>
  );
}
