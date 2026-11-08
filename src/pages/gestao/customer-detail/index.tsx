import { Pencil, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
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
import {
  CustomerBillingCard,
  CustomerBillingCardSkeleton,
} from "@/components/organisms/customer-billing-card";
import { CustomerDeleteButton } from "@/components/organisms/customer-delete-button";
import {
  CustomerInvoicesCard,
  CustomerInvoicesCardSkeleton,
} from "@/components/organisms/customer-invoices-card";
import { QueryError } from "@/components/organisms/query-error";
import {
  CustomerDebtsCard,
  CustomerDebtsCardSkeleton,
} from "@/components/organisms/customer-debts-card";
import { CustomerDetailLayout } from "@/components/templates/customer-detail-layout";
import { ROUTES, routeTo } from "@/constants/routes";
import { queryKeys } from "@/constants/query-keys";
import { isNotFound } from "@/helpers/api-error";
import { useCustomer } from "@/hooks/api/gestao/customers/useCustomer";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function CustomerDetailPage() {
  const { id = "" } = useParams();
  const customer = useCustomer(id);
  const backTo = useBackToList(ROUTES.customers);

  return (
    <Box className="space-y-4">
      <Box className="flex items-center justify-between gap-2">
        <BackLink to={backTo} label="Clientes" />
        {customer.data && (
          <Box className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.editCustomer(customer.data.id)}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <CustomerDeleteButton
              customerId={customer.data.id}
              name={customer.data.name}
              hasRentals={customer.data.rentals.length > 0}
            />
          </Box>
        )}
      </Box>
      {customer.isPending && (
        <SkeletonRegion label="Carregando cliente…">
          <CustomerDetailLayout
            summary={<CustomerSummarySkeleton />}
            license={<CustomerLicenseCardSkeleton />}
            contact={<CustomerContactCardSkeleton />}
            rentals={<CustomerRentalsSkeleton />}
            billing={<CustomerBillingCardSkeleton />}
            invoices={<CustomerInvoicesCardSkeleton />}
            debts={<CustomerDebtsCardSkeleton />}
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
          billing={
            <CustomerBillingCard
              customer={{ id: customer.data.id, name: customer.data.name }}
            />
          }
          invoices={
            <CustomerInvoicesCard
              customer={customer.data}
              rentals={customer.data.rentals}
            />
          }
          debts={<CustomerDebtsCard customerId={customer.data.id} />}
          documents={
            <DocumentsCard
              documents={customer.data.documents}
              manage={{
                owner: { type: "CUSTOMER", id: customer.data.id },
                invalidate: queryKeys.customers.detail(customer.data.id),
              }}
            />
          }
        />
      )}
    </Box>
  );
}
