import { CreditCard, Plus } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { EmptyState } from "@/components/molecules/empty-state";
import { PaymentCardDialog } from "@/components/organisms/payment-card-dialog";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { toApiError } from "@/helpers/api-error";
import { usePaymentCards } from "@/hooks/api/gestao/payment-cards/usePaymentCards";
import { usePaymentCardWrites } from "@/hooks/api/gestao/payment-cards/usePaymentCardWrites";
import type { PaymentCard } from "@/types/payment-card";
import { cn } from "@/utils/cn";
import { formatPercent } from "@/utils/percent";
import { toast } from "sonner";

/** One card: whose it is, its foreign surcharge, edit and delete. */
function PaymentCardItem({ card }: { card: PaymentCard }) {
  const { remove } = usePaymentCardWrites();
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3 pt-4 md:pt-6">
        <Box className="flex items-start justify-between gap-2">
          <Box className="flex min-w-0 items-center gap-2">
            <CreditCard className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <Text weight="semibold" className="min-w-0 break-words">
              {card.label}
            </Text>
          </Box>
          {!card.active && <Badge variant="outline">Inativo</Badge>}
        </Box>
        <Box className="space-y-1">
          <Text size="sm" tone="muted">
            {card.holder ? `De ${card.holder.name}` : "Da empresa"}
          </Text>
          <Text size="sm">
            Compra internacional:{" "}
            <Text inline size="sm" weight="medium" className="tabular-nums">
              {card.foreignSurchargePercent > 0
                ? `+ ${formatPercent(card.foreignSurchargePercent)}`
                : "sem acréscimo"}
            </Text>
          </Text>
        </Box>
        <Box className="mt-auto flex justify-end gap-1">
          <PaymentCardDialog
            card={card}
            trigger={
              <Button size="sm" variant="outline">
                Editar
              </Button>
            }
          />
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="ghost">
                Excluir
              </Button>
            }
            title={`Excluir ${card.name}?`}
            description="Só dá para excluir um cartão que nunca foi usado. Se já foi, inative em Editar."
            confirmLabel="Excluir"
            destructive
            isPending={remove.isPending}
            onConfirm={() =>
              remove.mutate(card.id, {
                onError: (error) => toast.error(toApiError(error).message),
              })
            }
          />
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * Financeiro › Cartões: the cards bills are paid with. The surcharge of each
 * one converts the fixed costs and one-offs in dollar or euro paid with it.
 */
export function FinanceCardsPage() {
  const cards = usePaymentCards();

  return (
    <Box className="space-y-4 md:space-y-6">
      <Box className="flex justify-end">
        <PaymentCardDialog
          trigger={
            <Button size="sm">
              <Plus />
              Novo cartão
            </Button>
          }
        />
      </Box>
      <QueryBoundary
        query={cards}
        label="Carregando os cartões"
        skeleton={<FinanceCardsSkeleton />}
      >
        {(list) =>
          list.length ? (
            <Row
              className={cn("gap-y-4 transition-opacity", cards.isFetching && "opacity-60")}
            >
              {list.map((card) => (
                <Col key={card.id} md={6} xl={4}>
                  <PaymentCardItem card={card} />
                </Col>
              ))}
            </Row>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="Nenhum cartão"
              description="Cadastre os cartões com que a empresa (ou alguém da equipe) paga as contas. Em custo em dólar ou euro, o acréscimo do cartão entra na conta."
              action={
                <PaymentCardDialog
                  trigger={
                    <Button>
                      <Plus />
                      Novo cartão
                    </Button>
                  }
                />
              }
            />
          )
        }
      </QueryBoundary>
    </Box>
  );
}

function FinanceCardsSkeleton() {
  return (
    <Row className="gap-y-4">
      {[0, 1, 2].map((index) => (
        <Col key={index} md={6} xl={4}>
          <Card className="h-full">
            <CardContent className="space-y-3 pt-4 md:pt-6">
              <Skeleton shape="text" className="w-2/3" />
              <Skeleton shape="text" className="w-28 text-sm" />
              <Skeleton shape="text" className="w-40 text-sm" />
              <Box className="flex justify-end gap-1">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </Box>
            </CardContent>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
