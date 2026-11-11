import { AiAnchor } from "@/components/atoms/ai-anchor";
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
import { CustomerAsaasChargesCard } from "@/components/organisms/customer-asaas-charges-card";
import {
  CustomerChargesCard,
  CustomerChargesCardSkeleton,
} from "@/components/organisms/customer-charges-card";
import {
  CustomerDebtsCard,
  CustomerDebtsCardSkeleton,
} from "@/components/organisms/customer-debts-card";
import {
  CustomerFlagsCard,
  CustomerFlagsCardSkeleton,
} from "@/components/organisms/customer-flags-card";
import {
  CustomerNotificationsCard,
  CustomerNotificationsCardSkeleton,
} from "@/components/organisms/customer-notifications-card";
import {
  CustomerWalletCard,
  CustomerWalletCardSkeleton,
} from "@/components/organisms/customer-wallet-card";
import {
  OwnerSignatures,
  OwnerSignaturesSkeleton,
} from "@/components/organisms/owner-signatures";
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
            charges={<CustomerChargesCardSkeleton />}
            documents={<DocumentsCardSkeleton />}
            flags={<CustomerFlagsCardSkeleton />}
            wallet={<CustomerWalletCardSkeleton />}
            notifications={<CustomerNotificationsCardSkeleton />}
            signatures={<OwnerSignaturesSkeleton />}
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
          summary={
            <AiAnchor id="summary">
              <CustomerSummary customer={customer.data} />
            </AiAnchor>
          }
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
          charges={
            <CustomerChargesCard
              customerId={customer.data.id}
              rentals={customer.data.rentals}
            />
          }
          asaasCharges={
            <CustomerAsaasChargesCard
              customerId={customer.data.id}
              rentals={customer.data.rentals}
            />
          }
          flags={<CustomerFlagsCard customer={customer.data} />}
          wallet={<CustomerWalletCard customer={customer.data} />}
          notifications={<CustomerNotificationsCard customer={customer.data} />}
          signatures={
            <OwnerSignatures ownerType="CUSTOMER" ownerId={customer.data.id} />
          }
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
