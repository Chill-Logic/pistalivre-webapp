import { FileText } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import { InvoiceItem } from "@/components/molecules/invoice-item";
import { PageHeader } from "@/components/molecules/page-header";
import { PortalChargeItem } from "@/components/molecules/portal-charge-item";
import {
  PortalRentalCard,
  PortalRentalCardSkeleton,
} from "@/components/molecules/portal-rental-card";
import { ReimbursementItem } from "@/components/molecules/reimbursement-item";
import { WalletKeyItem } from "@/components/molecules/wallet-key-item";
import {
  ListCard,
  ListCardSkeleton,
  ListRowSkeleton,
} from "@/components/organisms/list-card";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { HOME_REIMBURSEMENTS_LIMIT } from "@/constants/portal";
import { useMyCharges } from "@/hooks/api/cliente/finance/useMyCharges";
import { useMyInvoices } from "@/hooks/api/cliente/finance/useMyInvoices";
import { useMyReimbursements } from "@/hooks/api/cliente/finance/useMyReimbursements";
import { useMyWallet } from "@/hooks/api/cliente/finance/useMyWallet";
import { useMyRentals } from "@/hooks/api/cliente/rentals/useMyRentals";
import { pluralize } from "@/utils/text";

/**
 * Portal home = the renter's financial hub: rentals, every charge (with pix
 * to pay), authorized invoices, pix keys and reimbursement requests. Each
 * section loads on its own. Read-only for now.
 */
export function PortalHomePage() {
  const rentals = useMyRentals();
  const charges = useMyCharges();
  const invoices = useMyInvoices();
  const wallet = useMyWallet();
  const reimbursements = useMyReimbursements();

  return (
    <Box className="space-y-6">
      <PageHeader title="Minhas locações" />
      <QueryBoundary
        query={rentals}
        label="Carregando locações…"
        skeleton={
          <Row className="gap-y-4">
            <Col>
              <PortalRentalCardSkeleton />
            </Col>
          </Row>
        }
      >
        {(items) =>
          items.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhuma locação"
              description="Quando a locadora registrar a sua locação, ela aparece aqui."
            />
          ) : (
            <Row as="ul" className="gap-y-4">
              {items.map((rental) => (
                <Col as="li" key={rental.id}>
                  <PortalRentalCard rental={rental} />
                </Col>
              ))}
            </Row>
          )
        }
      </QueryBoundary>

      <QueryBoundary
        query={charges}
        label="Carregando cobranças…"
        skeleton={<ListCardSkeleton rows={2} row={<ListRowSkeleton />} />}
      >
        {(items) => (
          <ListCard
            title="Cobranças"
            empty="Nenhuma cobrança por enquanto."
            isEmpty={items.length === 0}
          >
            {items.map((charge) => (
              <PortalChargeItem key={charge.id} charge={charge} />
            ))}
          </ListCard>
        )}
      </QueryBoundary>

      <QueryBoundary
        query={invoices}
        label="Carregando notas fiscais…"
        skeleton={<ListCardSkeleton rows={1} row={<ListRowSkeleton />} />}
      >
        {(items) => (
          <ListCard
            title="Notas fiscais"
            empty="Nenhuma nota fiscal emitida."
            isEmpty={items.length === 0}
          >
            {items.map((invoice) => (
              <InvoiceItem key={invoice.id} invoice={invoice} />
            ))}
          </ListCard>
        )}
      </QueryBoundary>

      <QueryBoundary
        query={reimbursements}
        label="Carregando reembolsos…"
        skeleton={<ListCardSkeleton rows={2} row={<ListRowSkeleton />} />}
      >
        {(items) => (
          <ListCard
            title="Reembolsos"
            empty="Nenhum pedido de reembolso."
            isEmpty={items.length === 0}
            footer={
              items.length > HOME_REIMBURSEMENTS_LIMIT &&
              `Mais ${pluralize(items.length - HOME_REIMBURSEMENTS_LIMIT, "pedido", "pedidos")} na página de cada locação.`
            }
          >
            {items.slice(0, HOME_REIMBURSEMENTS_LIMIT).map((item) => (
              <ReimbursementItem key={item.id} reimbursement={item} />
            ))}
          </ListCard>
        )}
      </QueryBoundary>

      <QueryBoundary
        query={wallet}
        label="Carregando carteira…"
        skeleton={<ListCardSkeleton rows={1} row={<ListRowSkeleton />} />}
      >
        {(items) => (
          <ListCard
            title="Minha carteira"
            empty="Nenhuma chave pix cadastrada. É para ela que vão os seus reembolsos."
            isEmpty={items.length === 0}
          >
            {items.map((walletKey) => (
              <WalletKeyItem key={walletKey.id} walletKey={walletKey} />
            ))}
          </ListCard>
        )}
      </QueryBoundary>
    </Box>
  );
}
