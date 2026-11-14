import { ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { Button } from "@/components/atoms/button";
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
import { MaintenanceAttachDialog } from "@/components/organisms/maintenance-attach-dialog";
import { MaintenanceReportDialog } from "@/components/organisms/maintenance-report-dialog";
import { PortalInspectionDelete } from "@/components/organisms/portal-inspection-delete";
import { ReimbursementRequestDialog } from "@/components/organisms/reimbursement-request-dialog";
import { routeTo } from "@/constants/routes";
import { rentalStageNotice } from "@/helpers/portal";
import type { PortalRentalSections as Sections } from "@/types/portal";

/**
 * Everything inside the renter's rental, in the order they need it: pay,
 * prove (contract, CRLV, invoices), then the day-to-day of the vehicle. What
 * shows is decided by the API (progressive disclosure by status).
 */
export function PortalRentalSections({
  rentalId,
  sections,
  readOnly = false,
}: {
  rentalId: string;
  sections: Sections;
  /** Staff's "ver como cliente": same page, no writes nor payment links. */
  readOnly?: boolean;
}) {
  const canWrite = !readOnly && sections.operationalVisible && !sections.closed;
  const notice = rentalStageNotice(sections);

  return (
    <Row className="gap-y-6">
      <Col lg={8} className="space-y-6">
        {notice && <Alert variant="info">{notice}</Alert>}
        <ListCard
          title="Cobranças"
          empty="Nenhuma cobrança nesta locação."
          isEmpty={sections.charges.length === 0}
        >
          {sections.charges.map((charge) => (
            <PortalChargeItem
              key={charge.id}
              charge={charge}
              readOnly={readOnly}
            />
          ))}
        </ListCard>
        {sections.operationalVisible && (
          <ListCard
            title="Vistorias"
            empty="Nenhuma vistoria registrada."
            isEmpty={sections.inspections.length === 0}
            actions={
              canWrite && (
                <Button asChild size="sm">
                  <Link to={routeTo.portalInspectionNew(rentalId)}>
                    <ClipboardCheck />
                    Realizar vistoria
                  </Link>
                </Button>
              )
            }
          >
            {sections.inspections.map((inspection) => (
              <PortalInspectionItem
                key={inspection.id}
                inspection={inspection}
                actions={
                  canWrite &&
                  inspection.mine && (
                    <PortalInspectionDelete
                      rentalId={rentalId}
                      inspectionId={inspection.id}
                    />
                  )
                }
              />
            ))}
          </ListCard>
        )}
      </Col>
      <Col lg={4} className="space-y-6">
        <DocumentsCard
          title="Contrato"
          documents={sections.contracts}
          empty="O contrato aparece aqui quando for gerado."
        />
        {(sections.status === "ACTIVE" || sections.crlv.length > 0) && (
          // The renter has the vehicle only while active (the API sends it then).
          <DocumentsCard
            title="Documento do veículo (CRLV)"
            documents={sections.crlv}
            empty="CRLV ainda não disponível."
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
                        fixedAmount={
                          item.maintenanceId ? item.amount : undefined
                        }
                        defaultReason={item.reason}
                        triggerLabel="Pedir de novo"
                      />
                    )
                  }
                />
              ))}
            </ListCard>
            <ListCard
              title="Manutenções"
              empty={
                canWrite
                  ? "Nenhuma manutenção registrada. Pagou um serviço no veículo? Registre aqui e peça o reembolso."
                  : "Nenhuma manutenção registrada."
              }
              isEmpty={sections.maintenances.length === 0}
              actions={
                canWrite && <MaintenanceReportDialog rentalId={rentalId} />
              }
            >
              {sections.maintenances.map((maintenance) => {
                const live =
                  maintenance.reimbursement &&
                  maintenance.reimbursement.status !== "REJECTED";
                const canAsk = (maintenance.cost ?? 0) > 0 && !live;
                return (
                  <PortalMaintenanceItem
                    key={maintenance.id}
                    maintenance={maintenance}
                    actions={
                      canWrite &&
                      maintenance.mine && (
                        <>
                          <MaintenanceAttachDialog
                            rentalId={rentalId}
                            maintenanceId={maintenance.id}
                          />
                          {canAsk && (
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
                          )}
                        </>
                      )
                    }
                  />
                );
              })}
            </ListCard>
            <DocumentsCard documents={sections.documents} />
          </>
        ) : null}
        {sections.personalDocuments.length > 0 && (
          <DocumentsCard
            title="Meus documentos"
            documents={sections.personalDocuments}
          />
        )}
      </Col>
    </Row>
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
