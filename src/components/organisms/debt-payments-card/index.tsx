import { Receipt } from "lucide-react";
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
import { DocumentUploadDialog } from "@/components/organisms/document-upload-dialog";
import { ManageDocumentActions } from "@/components/organisms/documents-card";
import { queryKeys } from "@/constants/query-keys";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { DebtPayment } from "@/types/debt";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type DebtPaymentsCardProps = {
  payments: DebtPayment[];
  /**
   * Present = the staff can attach receipts to a payment (and rename or
   * delete them). The payment itself stays read-only: registering or
   * editing one is a money write.
   */
  debtId?: string;
};

/** Payment ledger with each payment's receipts. */
export function DebtPaymentsCard({ payments, debtId }: DebtPaymentsCardProps) {
  const { view, download } = useFileActions();
  const invalidate = debtId ? queryKeys.debts.detail(debtId) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pagamentos</CardTitle>
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
                  <Text weight="semibold" className="tabular-nums">
                    {formatCurrency(payment.amount)}
                  </Text>
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
