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
import { addressLines, hasEmergencyContact } from "@/helpers/customer";
import type { CustomerDetail } from "@/types/customer";

/** Address + emergency contact. */
export function CustomerContactCard({
  customer,
}: {
  customer: CustomerDetail;
}) {
  const lines = addressLines(customer.address);
  const emergency = customer.emergencyContact;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Endereço e emergência</CardTitle>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem label="Endereço">
            {lines.length > 0
              ? lines.map((line) => (
                  <Text key={line} inline className="block">
                    {line}
                  </Text>
                ))
              : null}
          </InfoItem>
          <InfoItem label="Contato de emergência">
            {hasEmergencyContact(emergency)
              ? [
                  [
                    emergency.name,
                    emergency.relation && `(${emergency.relation})`,
                  ]
                    .filter(Boolean)
                    .join(" "),
                  emergency.phone,
                  emergency.email,
                ]
                  .filter(Boolean)
                  .map((line) => (
                    <Text key={line as string} inline className="block">
                      {line}
                    </Text>
                  ))
              : null}
          </InfoItem>
        </Row>
      </CardContent>
    </Card>
  );
}

export function CustomerContactCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-40 text-base" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {[0, 1].map((index) => (
            <Col key={index} className="space-y-2">
              <Skeleton shape="text" className="w-20 text-xs" />
              <Skeleton shape="text" className="w-3/4 text-sm" />
              <Skeleton shape="text" className="w-1/2 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
