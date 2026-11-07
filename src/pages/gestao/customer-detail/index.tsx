import { Users } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  CustomerContactCard,
  CustomerContactCardSkeleton,
} from "@/components/organisms/customer-contact-card";
import {
  CustomerLicenseCard,
  CustomerLicenseCardSkeleton,
} from "@/components/organisms/customer-license-card";
import {
  CustomerRentals,
  CustomerRentalsSkeleton,
} from "@/components/organisms/customer-rentals";
import {
  CustomerSummary,
  CustomerSummarySkeleton,
} from "@/components/organisms/customer-summary";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import { QueryError } from "@/components/organisms/query-error";
import { CustomerDetailLayout } from "@/components/templates/customer-detail-layout";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useCustomer } from "@/hooks/api/gestao/customers/useCustomer";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function CustomerDetailPage() {
  const { id = "" } = useParams();
  const customer = useCustomer(id);
  const backTo = useBackToList(ROUTES.customers);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Clientes" />
      {customer.isPending && (
        <SkeletonRegion label="Carregando cliente…">
          <CustomerDetailLayout
            summary={<CustomerSummarySkeleton />}
            license={<CustomerLicenseCardSkeleton />}
            contact={<CustomerContactCardSkeleton />}
            rentals={<CustomerRentalsSkeleton />}
            documents={<DocumentsCardSkeleton />}
          />
        </SkeletonRegion>
      )}
      {customer.isError &&
        (isNotFound(customer.error) ? (
          <EmptyState
            icon={Users}
            title="Cliente não encontrado"
            description="Ele pode ter sido excluído ou o endereço está errado."
          />
        ) : (
          <QueryError
            error={customer.error}
            onRetry={() => customer.refetch()}
          />
        ))}
      {customer.data && (
        <CustomerDetailLayout
          summary={<CustomerSummary customer={customer.data} />}
          license={<CustomerLicenseCard customer={customer.data} />}
          contact={<CustomerContactCard customer={customer.data} />}
          rentals={<CustomerRentals rentals={customer.data.rentals} />}
          documents={<DocumentsCard documents={customer.data.documents} />}
        />
      )}
    </Box>
  );
}
