import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { TextLink } from "@/components/molecules/text-link";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { debtStatusVariant, interestDescription } from "@/helpers/debt";
import { useLabels } from "@/hooks/ui/useLabels";
import type { DebtDetail, DebtLender } from "@/types/debt";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

function LenderName({ lender }: { lender: DebtLender }) {
  return lender.customerId ? (
    <TextLink to={routeTo.customer(lender.customerId)}>{lender.name}</TextLink>
  ) : (
    <>{lender.name}</>
  );
}

export function DebtOverview({ debt }: { debt: DebtDetail }) {
  const { label } = useLabels();
  const interest = interestDescription(debt, label);

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Heading className="min-w-0 break-words">{debt.lendersLabel}</Heading>
          <Badge variant={debtStatusVariant(debt.status)}>
            {debt.status.label}
          </Badge>
        </Box>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem
            md={6}
            label={debt.lenders.length > 1 ? "Credores" : "Credor"}
          >
            {debt.lenders.map((lender) => (
              <Text key={lender.id} inline className="block">
                <LenderName lender={lender} />
                <Text inline size="xs" tone="muted">
                  {" · "}
                  {label(LABEL_MAPS.debtLenderType, lender.type)}
                </Text>
              </Text>
            ))}
          </InfoItem>
          <InfoItem span={6} md={3} label="Tipo">
            {label(LABEL_MAPS.debtKind, debt.kind)}
          </InfoItem>
          <InfoItem span={6} md={3} label="Pego em">
            {formatCalendarDate(debt.borrowedAt)}
          </InfoItem>
          <InfoItem span={6} md={3} label="Valor emprestado">
            {formatCurrency(debt.principal)}
          </InfoItem>
          <InfoItem span={6} md={3} label="Parcelas">
            {debt.installments > 1 ? `${debt.installments}x` : "À vista"}
          </InfoItem>
          <InfoItem
            span={6}
            md={3}
            label={debt.installments > 1 ? "1ª parcela" : "Vencimento"}
          >
            {debt.dueDate
              ? formatCalendarDate(debt.dueDate)
              : "Sem data combinada"}
          </InfoItem>
          <InfoItem span={6} md={3} label="Juros">
            {interest ?? "Sem juros"}
          </InfoItem>
          <InfoItem md={6} label="Veículo">
            {debt.vehicle ? (
              <>
                <TextLink to={routeTo.vehicle(debt.vehicle.id)}>
                  {formatPlate(debt.vehicle.plate)}
                </TextLink>{" "}
                · {debt.vehicle.label}
              </>
            ) : (
              "Da empresa"
            )}
          </InfoItem>
          <InfoItem md={6} label="Custo mensal">
            {debt.countsAsCost
              ? `${formatCurrency(debt.monthlyCost)} por mês entram no custo`
              : "Fora do custo mensal"}
          </InfoItem>
          {debt.createdByName && (
            <InfoItem md={6} label="Registrada por">
              {debt.createdByName}
            </InfoItem>
          )}
          {debt.notes && <InfoItem label="Observações">{debt.notes}</InfoItem>}
        </Row>
      </CardContent>
    </Card>
  );
}

export function DebtOverviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-1/2 text-2xl" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Col key={index} span={6} md={3} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-24 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
