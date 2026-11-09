import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { InfoItem } from "@/components/molecules/info-item";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { SupplierDetail } from "@/types/supplier";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { formatMonth } from "@/utils/month";

export function SupplierSummary({ supplier }: { supplier: SupplierDetail }) {
  const { label } = useLabels();
  const isVehicle = supplier.scope === "VEHICLE";

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Heading className="min-w-0 break-words">{supplier.name}</Heading>
          <Badge variant={supplier.active ? "success" : "outline"}>
            {supplier.active ? "Ativo" : "Inativo"}
          </Badge>
        </Box>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem span={6} md={4} label="Escopo">
            {label(LABEL_MAPS.supplierScope, supplier.scope)}
          </InfoItem>
          <InfoItem
            span={6}
            md={4}
            label={isVehicle ? "Valor padrão / mês" : "Valor / mês"}
          >
            {formatCurrency(supplier.monthlyAmount)}
          </InfoItem>
          {isVehicle && (
            <InfoItem span={6} md={4} label="Total dos veículos / mês">
              {formatCurrency(supplier.vehiclesMonthlyTotal)}
            </InfoItem>
          )}
          {isVehicle && (
            <InfoItem span={6} md={4} label="Como é cobrado">
              {label(LABEL_MAPS.supplierBilling, supplier.billing)}
            </InfoItem>
          )}
          <InfoItem span={6} md={4} label="Vence todo">
            {supplier.dueDay ? `Dia ${supplier.dueDay}` : "Não informado"}
          </InfoItem>
          <InfoItem span={6} md={4} label="Vigência">
            {supplier.startsOn ? `De ${formatMonth(supplier.startsOn)}` : "Desde o cadastro"}
            {supplier.endsOn ? ` até ${formatMonth(supplier.endsOn)}` : ", sem fim"}
          </InfoItem>
          <InfoItem md={4} label="Atualizado em">
            {formatDateTime(supplier.updatedAt)}
          </InfoItem>
        </Row>
      </CardContent>
    </Card>
  );
}

export function SupplierSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-1/2 text-2xl" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Col key={index} span={6} md={4} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-24 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
