import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { CustomerStatusBadge } from "@/components/molecules/customer-status-badge";
import { InfoItem } from "@/components/molecules/info-item";
import type { CustomerDetail } from "@/types/customer";
import { formatCpf } from "@/utils/document";
import { ageInYears, todayInBrasilia } from "@/utils/date";
import { formatCalendarDate, formatDateTime } from "@/utils/format";

export function CustomerSummary({ customer }: { customer: CustomerDetail }) {
  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Heading className="min-w-0 break-words">{customer.name}</Heading>
          <CustomerStatusBadge
            status={customer.status}
            isTest={customer.isTest}
          />
        </Box>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem md={6} label="E-mail">
            {customer.email}
          </InfoItem>
          <InfoItem md={6} label="Telefone">
            {customer.phone}
          </InfoItem>
          <InfoItem span={6} md={4} label="CPF" mono>
            {formatCpf(customer.document)}
          </InfoItem>
          <InfoItem span={6} md={4} label="RG" mono>
            {customer.rg}
          </InfoItem>
          <InfoItem md={4} label="Nascimento">
            {customer.birthDate
              ? `${formatCalendarDate(customer.birthDate)} · ${ageInYears(customer.birthDate, todayInBrasilia())} anos`
              : null}
          </InfoItem>
          <InfoItem span={6} md={4} label="Nacionalidade">
            {customer.nationality}
          </InfoItem>
          <InfoItem span={6} md={4} label="Estado civil">
            {customer.maritalStatus}
          </InfoItem>
          <InfoItem span={6} md={4} label="Profissão">
            {customer.profession}
          </InfoItem>
          <InfoItem md={4} label="Último acesso ao portal">
            {customer.lastLoginAt
              ? formatDateTime(customer.lastLoginAt)
              : "Nunca"}
          </InfoItem>
          <InfoItem md={6} label="Asaas">
            {customer.asaasCustomerId ? "Vinculado" : "Não vinculado"}
          </InfoItem>
          {customer.excludeFromMetrics && (
            <InfoItem md={6} label="Métricas">
              Fora da inadimplência
            </InfoItem>
          )}
        </Row>
      </CardContent>
    </Card>
  );
}

const SUMMARY_FIELDS = 10;

export function CustomerSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-2/3 text-2xl" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {Array.from({ length: SUMMARY_FIELDS }, (_, index) => (
            <Col key={index} span={6} md={4} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-28 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
