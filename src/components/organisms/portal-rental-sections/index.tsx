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
import { ReimbursementRequestDialog } from "@/components/organisms/reimbursement-request-dialog";
import type { PortalRentalSections as Sections } from "@/types/portal";

/**
 * Everything inside the renter's rental, in the order they need it: pay,
 * prove (contract, CRLV, invoices), then the day-to-day of the vehicle. What
 * shows is decided by the API (progressive disclosure by status).
 */
export function PortalRentalSections({
  rentalId,
  sections,
}: {
  rentalId: string;
  sections: Sections;
}) {
  const canWrite = sections.operationalVisible && !sections.closed;

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
            empty={
              canWrite
                ? "Pagou algo do veículo do seu bolso? Peça o reembolso aqui."
                : "Nenhum pedido de reembolso nesta locação."
            }
            isEmpty={sections.reimbursements.length === 0}
            actions={
              canWrite && (
                <ReimbursementRequestDialog
                  rentalId={rentalId}
                  triggerVariant="default"
                />
              )
            }
          >
            {sections.reimbursements.map((item) => (
              <ReimbursementItem
                key={item.id}
                reimbursement={item}
                actions={
                  canWrite &&
                  item.status === "REJECTED" && (
                    <ReimbursementRequestDialog
                      rentalId={rentalId}
                      maintenanceId={item.maintenanceId ?? undefined}
                      fixedAmount={item.maintenanceId ? item.amount : undefined}
                      defaultReason={item.reason}
                      triggerLabel="Pedir de novo"
                    />
                  )
                }
              />
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
            {sections.maintenances.map((maintenance) => {
              const live =
                maintenance.reimbursement &&
                maintenance.reimbursement.status !== "REJECTED";
              const canAsk =
                canWrite &&
                maintenance.mine &&
                (maintenance.cost ?? 0) > 0 &&
                !live;
              return (
                <PortalMaintenanceItem
                  key={maintenance.id}
                  maintenance={maintenance}
                  actions={
                    canAsk && (
                      <ReimbursementRequestDialog
                        rentalId={rentalId}
                        maintenanceId={maintenance.id}
                        fixedAmount={maintenance.cost ?? undefined}
                        defaultReason={`Reembolso da manutenção: ${maintenance.description ?? ""}`.trim()}
                        triggerLabel={
                          maintenance.reimbursement
                            ? "Pedir de novo"
                            : "Pedir reembolso"
                        }
                      />
                    )
                  }
                />
              );
            })}
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
