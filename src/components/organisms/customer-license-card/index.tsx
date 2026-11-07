import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { isLicenseExpired } from "@/helpers/customer";
import type { CustomerDetail } from "@/types/customer";
import { formatCalendarDate } from "@/utils/format";

/** CNH: captured in the contract flow; a valid one is required to generate it. */
export function CustomerLicenseCard({
  customer,
}: {
  customer: CustomerDetail;
}) {
  const expired = isLicenseExpired(customer.driverLicenseValidUntil);

  return (
    <Card>
      <CardHeader>
        <Box className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">CNH</CardTitle>
          {expired && <Badge variant="error">Vencida</Badge>}
        </Box>
      </CardHeader>
      <CardContent>
        {!customer.driverLicense ? (
          <Text tone="muted">
            Ainda não informada. Ela é pedida ao gerar o contrato.
          </Text>
        ) : (
          <Row as="dl" className="gap-y-4">
            <InfoItem label="Número" mono>
              {customer.driverLicense}
            </InfoItem>
            <InfoItem span={6} label="Emissão">
              {customer.driverLicenseIssuedAt
                ? formatCalendarDate(customer.driverLicenseIssuedAt)
                : null}
            </InfoItem>
            <InfoItem span={6} label="Validade">
              {customer.driverLicenseValidUntil
                ? formatCalendarDate(customer.driverLicenseValidUntil)
                : null}
            </InfoItem>
          </Row>
        )}
      </CardContent>
    </Card>
  );
}

export function CustomerLicenseCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-12 text-base" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {[12, 6, 6].map((span, index) => (
            <Col key={index} span={span === 12 ? 12 : 6} className="space-y-2">
              <Skeleton shape="text" className="w-14 text-xs" />
              <Skeleton shape="text" className="w-24 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
