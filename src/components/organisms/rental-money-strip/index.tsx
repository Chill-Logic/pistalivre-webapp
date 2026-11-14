import { Card } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { TextLink } from "@/components/molecules/text-link";
import { routeTo } from "@/constants/routes";
import { useRentStatement } from "@/hooks/api/comum/rent-statement/useRentStatement";
import type { RentStatementParams } from "@/types/rent-statement";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

// Same params as the statement screen opens with: the cache is shared.
const PARAMS: RentStatementParams = { mode: "OLDEST" };

const CELL = "space-y-1 px-4 py-3 md:px-5 md:py-4";

/**
 * "Where this rental stands" right under its summary: what is owed, the next
 * due date and what was paid. Numbers come ready from the rent statement
 * (server); nothing is summed here. A rental with no rent ledger yet (no
 * charge) shows nothing.
 */
export function RentalMoneyStrip({ rentalId }: { rentalId: string }) {
  const query = useRentStatement("staff", rentalId, PARAMS);
  if (query.isPending) return <RentalMoneyStripSkeleton />;
  const report = query.data;
  if (!report?.available) return null;
  const { statement } = report;
  const owes = statement.balance > 0;

  return (
    <Card>
      <Row className="mx-0 divide-y md:divide-x md:divide-y-0">
        <Col md={4} className={CELL}>
          <Text size="xs" tone="muted">
            {owes ? "Falta pagar" : "Situação"}
          </Text>
          <Text
            size={null}
            weight="bold"
            className={cn(
              "text-xl",
              owes ? "text-destructive" : "text-success-foreground",
            )}
          >
            {owes ? formatCurrency(statement.balance) : "Em dia"}
          </Text>
          <Text size="xs" tone="muted">
            {owes
              ? statement.openFrom &&
                `Em aberto desde ${formatCalendarDate(statement.openFrom)}`
              : statement.paidThrough &&
                `Pago até ${formatCalendarDate(statement.paidThrough)}`}
          </Text>
        </Col>
        <Col md={4} className={CELL}>
          <Text size="xs" tone="muted">
            Próximo vencimento
          </Text>
          <Text size={null} weight="bold" className="text-xl">
            {statement.current ? formatCurrency(statement.current.amount) : "—"}
          </Text>
          <Text size="xs" tone="muted">
            {statement.current
              ? `Vence ${formatCalendarDate(statement.current.due)}`
              : "Nada a vencer"}
          </Text>
        </Col>
        <Col md={4} className={CELL}>
          <Text size="xs" tone="muted">
            Total pago
          </Text>
          <Text size={null} weight="bold" className="text-xl">
            {formatCurrency(statement.totalPaid)}
          </Text>
          <Text size="xs" tone="muted">
            {statement.credit > 0 ? (
              `Crédito de ${formatCurrency(statement.credit)}`
            ) : (
              <TextLink
                to={routeTo.rentalStatement(rentalId)}
                className="font-normal text-muted-foreground"
              >
                Ver extrato
              </TextLink>
            )}
          </Text>
        </Col>
      </Row>
    </Card>
  );
}

export function RentalMoneyStripSkeleton() {
  return (
    <Card>
      <Row className="mx-0 divide-y md:divide-x md:divide-y-0">
        {[0, 1, 2].map((index) => (
          <Col key={index} md={4} className={cn(CELL, "space-y-2")}>
            <Skeleton shape="text" className="w-20 text-xs" />
            <Skeleton shape="text" className="w-28 text-xl" />
            <Skeleton shape="text" className="w-24 text-xs" />
          </Col>
        ))}
      </Row>
    </Card>
  );
}
