import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { TextLink } from "@/components/molecules/text-link";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { serviceLines } from "@/helpers/maintenance";
import { useLabels } from "@/hooks/ui/useLabels";
import type { MaintenanceDetail } from "@/types/maintenance";
import {
  formatCalendarDate,
  formatCurrency,
  formatDateTime,
  formatMileage,
} from "@/utils/format";
import { formatPlate } from "@/utils/plate";

export function MaintenanceSummary({
  maintenance,
}: {
  maintenance: MaintenanceDetail;
}) {
  const { label } = useLabels();
  const services = serviceLines(maintenance, label);
  const byCustomer = maintenance.registeredBy === "CUSTOMER";

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Heading className="min-w-0 break-words">
            {label(LABEL_MAPS.maintenanceType, maintenance.type)} ·{" "}
            {formatCalendarDate(maintenance.performedAt)}
          </Heading>
          {byCustomer && <Badge variant="warning">Paga pelo locatário</Badge>}
        </Box>
      </CardHeader>
      <CardContent className="space-y-6">
        <Row as="dl" className="gap-y-4">
          <InfoItem md={6} label="Veículo">
            <TextLink to={routeTo.vehicle(maintenance.vehicle.id)}>
              {formatPlate(maintenance.vehicle.plate)}
            </TextLink>{" "}
            · {maintenance.vehicle.label}
          </InfoItem>
          <InfoItem md={6} label="Locação">
            {maintenance.rental ? (
              <>
                <TextLink to={routeTo.rental(maintenance.rental.id)}>
                  {maintenance.rental.code}
                </TextLink>{" "}
                ·{" "}
                <TextLink to={routeTo.customer(maintenance.rental.customer.id)}>
                  {maintenance.rental.customer.name}
                </TextLink>
              </>
            ) : (
              "Sem locação"
            )}
          </InfoItem>
          <InfoItem span={6} md={4} label="Valor">
            {maintenance.cost !== null
              ? formatCurrency(maintenance.cost)
              : null}
          </InfoItem>
          <InfoItem span={6} md={4} label="Km">
            {maintenance.mileage !== null
              ? formatMileage(maintenance.mileage)
              : null}
          </InfoItem>
          <InfoItem md={4} label="Oficina">
            {maintenance.provider}
          </InfoItem>
          <InfoItem
            md={6}
            label={byCustomer ? "Registrada pelo locatário" : "Registrada por"}
          >
            {maintenance.performedByName}
          </InfoItem>
          <InfoItem md={6} label="Lançada em">
            {formatDateTime(maintenance.createdAt)}
          </InfoItem>
        </Row>
        <Box className="space-y-2">
          <Text size="xs" tone="muted">
            Serviços
          </Text>
          {services.length === 0 ? (
            <Text>Nenhum serviço marcado.</Text>
          ) : (
            <List className="flex flex-wrap gap-2">
              {services.map((service) => (
                <ListItem key={service.code}>
                  <Badge variant="outline">{service.text}</Badge>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
        {maintenance.description && (
          <Box className="space-y-2">
            <Text size="xs" tone="muted">
              Descrição
            </Text>
            <Text className="whitespace-pre-line">
              {maintenance.description}
            </Text>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

const SUMMARY_FIELDS = 7;

export function MaintenanceSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-2/3 text-2xl" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Row className="gap-y-4">
          {Array.from({ length: SUMMARY_FIELDS }, (_, index) => (
            <Col key={index} span={6} md={4} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-28 text-sm" />
            </Col>
          ))}
        </Row>
        <Box className="space-y-2">
          <Skeleton shape="text" className="w-16 text-xs" />
          <Box className="flex gap-2">
            <Skeleton shape="pill" className="h-5 w-24" />
            <Skeleton shape="pill" className="h-5 w-20" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
