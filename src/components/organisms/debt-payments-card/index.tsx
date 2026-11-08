import { Receipt } from "lucide-react";
import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { DocumentItem } from "@/components/molecules/document-item";
import { EmptyState } from "@/components/molecules/empty-state";
import { DebtPaymentDeleteButton } from "@/components/organisms/debt-payment-delete-button";
import { DocumentUploadDialog } from "@/components/organisms/document-upload-dialog";
import { ManageDocumentActions } from "@/components/organisms/documents-card";
import { queryKeys } from "@/constants/query-keys";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { DebtPayment } from "@/types/debt";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type DebtPaymentsCardProps = {
  payments: DebtPayment[];
  /**
   * Present = the staff manages it: delete a payment, attach receipts to it
   * (rename or delete them). There is no edit: delete and log again.
   */
  debtId?: string;
  /** "Registrar pagamento", in the header. */
  action?: ReactNode;
};

/** Payment ledger with each payment's receipts. */
export function DebtPaymentsCard({
  payments,
  debtId,
  action,
}: DebtPaymentsCardProps) {
  const { view, download } = useFileActions();
  const invalidate = debtId ? queryKeys.debts.detail(debtId) : null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Pagamentos</CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <EmptyState icon={Receipt} title="Nenhum pagamento lançado" />
        ) : (
          <List className="divide-y">
            {payments.map((payment) => (
              <ListItem key={payment.id} className="space-y-1 py-3">
                <Box className="flex items-baseline justify-between gap-3">
                  <Text weight="medium">
                    {formatCalendarDate(payment.paidAt)}
                  </Text>
                  <Box className="flex items-center gap-1">
                    <Text weight="semibold" className="tabular-nums">
                      {formatCurrency(payment.amount)}
                    </Text>
                    {invalidate && (
                      <DebtPaymentDeleteButton payment={payment} />
                    )}
                  </Box>
                </Box>
                {(payment.surcharge > 0 || payment.discount > 0) && (
                  <Text size="xs" tone="muted">
                    {[
                      payment.surcharge > 0 &&
                        `${formatCurrency(payment.surcharge)} de multa/juros`,
                      payment.discount > 0 &&
                        `${formatCurrency(payment.discount)} de desconto`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                )}
                {payment.notes && (
                  <Text size="xs" tone="muted">
                    {payment.notes}
                  </Text>
                )}
                {payment.createdByName && (
                  <Text size="xs" tone="muted">
                    Lançado por {payment.createdByName}
                  </Text>
                )}
                {payment.documents.length > 0 && (
                  <Box className="divide-y">
                    {payment.documents.map((document) => (
                      <DocumentItem
                        key={document.id}
                        document={document}
                        onView={() => view.mutate(document)}
                        onDownload={() => download.mutate(document)}
                        isViewing={
                          view.isPending && view.variables?.id === document.id
                        }
                        isDownloading={
                          download.isPending &&
                          download.variables?.id === document.id
                        }
                        actions={
                          invalidate && (
                            <ManageDocumentActions
                              document={document}
                              owner={{ type: "DEBT_PAYMENT", id: payment.id }}
                              invalidate={invalidate}
                            />
                          )
                        }
                      />
                    ))}
                  </Box>
                )}
                {invalidate && (
                  <Box className="pt-1">
                    <DocumentUploadDialog
                      owner={{ type: "DEBT_PAYMENT", id: payment.id }}
                      invalidate={invalidate}
                      triggerLabel="Anexar comprovante"
                    />
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
