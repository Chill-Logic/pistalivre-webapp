import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { TextLink } from "@/components/molecules/text-link";
import { ReconciliationItem, ReconciliationItemSkeleton } from "@/components/molecules/reconciliation-item";
import { ChargeSettleDialog } from "@/components/organisms/charge-settle-dialog";
import { ReconciliationReceiptDialog } from "@/components/organisms/reconciliation-receipt-dialog";
import { ROUTES } from "@/constants/routes";
import { useDismissReconciliation } from "@/hooks/api/gestao/reconciliation/useReconciliation";
import type { ReconciliationView, ReconSuggestion } from "@/types/reconciliation";
import { pluralize } from "@/utils/text";

/**
 * "Pix para conciliar": pix that fell in the Inter and what each most likely
 * pays. Only suggestions — the person confirms (register the pix of a daily
 * rental / settle the charge), says "não é este" (the next option shows, the
 * pair never comes back) or ignores the pix. Not rendered when there is
 * nothing to suggest.
 */
export function ReconciliationCard({ view }: { view: ReconciliationView }) {
  const dismiss = useDismissReconciliation();
  if (view.suggestions.length === 0 && !view.error) return null;

  const accept = (s: ReconSuggestion) => {
    const target = s.targets[0];
    if (target.kind === "receipt") {
      return <ReconciliationReceiptDialog credit={s.credit} rentalId={target.rentalId} rentalCode={target.rentalCode} />;
    }
    return (
      <ChargeSettleDialog
        charge={{
          id: target.paymentId,
          rentalId: target.rentalId,
          channel: target.channel,
          dueDate: target.dueDate ?? s.credit.date,
          amounts: {
            amount: target.chargeAmount,
            principal: target.chargeAmount,
            surcharge: 0,
            shortfall: 0,
            discount: 0,
            isPaid: false,
          },
        }}
        initial={{ paidValue: s.credit.amount, paidAt: s.credit.date }}
        trigger={{ label: "Dar baixa", variant: "default" }}
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle className="text-base">Pix para conciliar</CardTitle>
          {view.suggestions.length > 0 && (
            <Text tone="muted">
              {pluralize(view.suggestions.length, "sugestão", "sugestões")} do extrato do Inter
            </Text>
          )}
        </Box>
      </CardHeader>
      <CardContent>
        {view.error &&
          // The API's message is for the developer (field names); the person
          // gets what happened and where to fix it.
          (/incompleta/i.test(view.error) ? (
            <Alert variant="info" role="status">
              A conexão com o Inter ainda não foi configurada. Quando estiver, os pix recebidos aparecem aqui
              com a cobrança que cada um paga.{" "}
              <TextLink to={ROUTES.integrations}>Configurar o Inter</TextLink>
            </Alert>
          ) : (
            <Alert variant="warning">
              Não foi possível ler o extrato do Inter agora. Tente de novo em alguns minutos.
            </Alert>
          ))}
        <Box className="divide-y">
          {view.suggestions.map((s) => {
            const target = s.targets[0];
            const busy = dismiss.isPending && dismiss.variables?.bankKey === s.credit.key;
            return (
              <ReconciliationItem
                key={`${s.credit.key}:${s.customer.id}`}
                suggestion={s}
                actions={
                  <>
                    {accept(s)}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => dismiss.mutate({ bankKey: s.credit.key, targetKey: target.key })}
                    >
                      Não é este
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      className="text-muted-foreground"
                      onClick={() => dismiss.mutate({ bankKey: s.credit.key, targetKey: "line" })}
                    >
                      Ignorar pix
                    </Button>
                  </>
                }
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

export function ReconciliationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-36 text-base" />
      </CardHeader>
      <CardContent>
        <ReconciliationItemSkeleton />
        <ReconciliationItemSkeleton />
      </CardContent>
    </Card>
  );
}
