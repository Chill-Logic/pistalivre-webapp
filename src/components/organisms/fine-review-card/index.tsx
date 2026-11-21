import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { TextLink } from "@/components/molecules/text-link";
import { routeTo } from "@/constants/routes";
import {
  useAdjustFine,
  useDiscountFine,
} from "@/hooks/api/gestao/fine-review/useFineReview";
import type { FineReviewItem } from "@/types/fine-review";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

const pct = (n: number) => `${String(n).replace(".", ",")}%`;
const day = (iso: string | null) =>
  iso ? formatCalendarDate(iso).slice(0, 5) : "—";

/** Who and which rental, linking to the rental. */
function Who({ item }: { item: FineReviewItem }) {
  return (
    <Text weight="medium">
      {item.customerName ?? "Cliente"}
      {item.rentalCode && item.rentalId && (
        <>
          {" · "}
          <TextLink to={routeTo.rental(item.rentalId)}>
            {item.rentalCode}
          </TextLink>
        </>
      )}
    </Text>
  );
}

/** A paid charge: charged × rule × to give back, and the one-click discount. */
function PaidRow({ item }: { item: FineReviewItem }) {
  const discount = useDiscountFine();
  if (item.review.kind !== "paid") return null;
  const r = item.review;
  return (
    <Box className="flex flex-col gap-3 border-b py-3 last:border-0 md:flex-row md:items-center md:justify-between">
      <Box className="space-y-1">
        <Who item={item} />
        <Text size="sm" tone="muted">
          Aluguel de {day(item.dueDate)}, pago em {day(item.paidAt)} com multa
          de {pct(r.finePercent)}
        </Text>
        <Text size="sm">
          Cobrado {formatCurrency(r.charged)} · pela regra (
          {pct(r.ruleFinePercent)}) {formatCurrency(r.allowed)} ·{" "}
          <Text inline weight="semibold">
            a devolver {formatCurrency(r.excess)}
          </Text>
        </Text>
      </Box>
      {item.discount ? (
        <Badge variant="outline">
          {item.discount.status === "APPLIED"
            ? "Descontado na próxima cobrança"
            : "Vai na próxima cobrança"}
        </Badge>
      ) : (
        <ConfirmDialog
          trigger={
            <Button variant="outline">Descontar na próxima cobrança</Button>
          }
          title="Descontar a multa a mais?"
          description={`${formatCurrency(r.excess)} saem da próxima cobrança de aluguel de ${item.customerName ?? "cliente"}. Se ela já foi emitida, o valor cai agora (no Asaas também); senão, ela sai com o desconto. O desconto aparece no extrato como "Ajuste da multa de ${day(item.dueDate)} (${pct(r.ruleFinePercent)})".`}
          confirmLabel="Descontar"
          isPending={discount.isPending}
          onConfirm={() => discount.mutate(item.paymentId)}
        />
      )}
    </Box>
  );
}

/** An open charge still carrying the old fee: lower it before it is paid. */
function OpenRow({ item }: { item: FineReviewItem }) {
  const adjust = useAdjustFine();
  if (item.review.kind !== "open") return null;
  const r = item.review;
  return (
    <Box className="flex flex-col gap-3 border-b py-3 last:border-0 md:flex-row md:items-center md:justify-between">
      <Box className="space-y-1">
        <Who item={item} />
        <Text size="sm" tone="muted">
          {formatCurrency(item.amount)} · vence {day(item.dueDate)} · multa de{" "}
          {pct(r.finePercent)} (regra: {pct(r.ruleFinePercent)})
        </Text>
      </Box>
      {r.overdue ? (
        <Text size="sm" tone="muted" className="md:max-w-xs md:text-right">
          Vencida: o Asaas não deixa mudar a multa. Se for paga com{" "}
          {pct(r.finePercent)}, a diferença aparece aqui para descontar na
          próxima cobrança.
        </Text>
      ) : (
        <ConfirmDialog
          trigger={
            <Button variant="outline">
              Ajustar para {pct(r.ruleFinePercent)}
            </Button>
          }
          title={`Ajustar a multa para ${pct(r.ruleFinePercent)}?`}
          description={`A cobrança de ${formatCurrency(item.amount)} que vence ${day(item.dueDate)} passa a ter multa de ${pct(r.ruleFinePercent)}, aqui e no Asaas.`}
          confirmLabel="Ajustar"
          isPending={adjust.isPending}
          onConfirm={() => adjust.mutate(item.paymentId)}
        />
      )}
    </Box>
  );
}

export function FineReviewCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 pt-4 md:pt-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * Financeiro › "Multas acima da regra": charges that still carry the old 10%
 * late fee. Open ones get the fee lowered; paid ones show what was charged,
 * what the rule allows for the same delay and what goes back, with one click
 * to discount it on the next rent charge (the server does every number). Not
 * rendered when there is nothing to act on; already applied discounts leave.
 */
export function FineReviewCard({ items }: { items: FineReviewItem[] }) {
  const paid = items.filter(
    (i) => i.review.kind === "paid" && i.discount?.status !== "APPLIED",
  );
  const open = items.filter((i) => i.review.kind === "open");
  if (paid.length === 0 && open.length === 0) return null;
  const toGive = paid
    .filter((i) => !i.discount)
    .reduce((s, i) => s + (i.review.kind === "paid" ? i.review.excess : 0), 0);
  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle className="text-base">Multas acima da regra</CardTitle>
          <Text tone="muted">
            {pluralize(paid.length + open.length, "cobrança", "cobranças")}
            {toGive > 0 ? ` · ${formatCurrency(toGive)} a devolver` : ""}
          </Text>
        </Box>
      </CardHeader>
      <CardContent>
        {paid.map((item) => (
          <PaidRow key={item.paymentId} item={item} />
        ))}
        {open.map((item) => (
          <OpenRow key={item.paymentId} item={item} />
        ))}
      </CardContent>
    </Card>
  );
}
