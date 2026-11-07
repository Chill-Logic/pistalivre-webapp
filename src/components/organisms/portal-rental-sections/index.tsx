import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { InvoiceItem } from "@/components/molecules/invoice-item";
import { PortalChargeItem } from "@/components/molecules/portal-charge-item";
import { PortalInspectionItem } from "@/components/molecules/portal-inspection-item";
import { PortalMaintenanceItem } from "@/components/molecules/portal-maintenance-item";
import { ReimbursementItem } from "@/components/molecules/reimbursement-item";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import {
  ListCard,
  ListCardSkeleton,
  ListRowSkeleton,
} from "@/components/organisms/list-card";
import type { PortalRentalSections as Sections } from "@/types/portal";

/**
 * Everything inside the renter's rental, in the order they need it: pay,
 * prove (contract, CRLV, invoices), then the day-to-day of the vehicle. What
 * shows is decided by the API (progressive disclosure by status).
 */
export function PortalRentalSections({ sections }: { sections: Sections }) {
  return (
    <Box className="space-y-6">
      {sections.closed && (
        <Alert variant="info">
          Locação encerrada: aqui fica só para consulta.
        </Alert>
      )}
      <ListCard
        title="Cobranças"
        empty="Nenhuma cobrança nesta locação."
        isEmpty={sections.charges.length === 0}
      >
        {sections.charges.map((charge) => (
          <PortalChargeItem key={charge.id} charge={charge} />
        ))}
      </ListCard>
      <DocumentsCard
        title="Contrato"
        documents={sections.contracts}
        empty="O contrato aparece aqui quando for gerado."
      />
      {sections.crlv.length > 0 && (
        <DocumentsCard
          title="Documento do veículo (CRLV)"
          documents={sections.crlv}
        />
      )}
      {sections.financialVisible && (
        <ListCard
          title="Notas fiscais"
          empty="Nenhuma nota fiscal desta locação."
          isEmpty={sections.invoices.length === 0}
        >
          {sections.invoices.map((invoice) => (
            <InvoiceItem key={invoice.id} invoice={invoice} />
          ))}
        </ListCard>
      )}
      {sections.operationalVisible ? (
        <>
          <ListCard
            title="Reembolsos"
            empty="Nenhum pedido de reembolso nesta locação."
            isEmpty={sections.reimbursements.length === 0}
          >
            {sections.reimbursements.map((item) => (
              <ReimbursementItem key={item.id} reimbursement={item} />
            ))}
          </ListCard>
          <ListCard
            title="Vistorias"
            empty="Nenhuma vistoria registrada."
            isEmpty={sections.inspections.length === 0}
          >
            {sections.inspections.map((inspection) => (
              <PortalInspectionItem
                key={inspection.id}
                inspection={inspection}
              />
            ))}
          </ListCard>
          <ListCard
            title="Manutenções"
            empty="Nenhuma manutenção registrada."
            isEmpty={sections.maintenances.length === 0}
          >
            {sections.maintenances.map((maintenance) => (
              <PortalMaintenanceItem
                key={maintenance.id}
                maintenance={maintenance}
              />
            ))}
          </ListCard>
          <DocumentsCard documents={sections.documents} />
        </>
      ) : (
        !sections.closed && (
          <Alert variant="info">
            Vistorias, manutenções e reembolsos aparecem aqui quando a locação
            estiver ativa.
          </Alert>
        )
      )}
    </Box>
  );
}

export function PortalRentalSectionsSkeleton() {
  return (
    <Box className="space-y-6">
      <ListCardSkeleton rows={2} row={<ListRowSkeleton />} />
      <DocumentsCardSkeleton />
      <ListCardSkeleton rows={1} row={<ListRowSkeleton />} />
    </Box>
  );
}
