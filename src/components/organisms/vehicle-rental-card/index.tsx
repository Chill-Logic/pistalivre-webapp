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
import { TextLink } from "@/components/molecules/text-link";
import { routeTo } from "@/constants/routes";
import type { ActiveRental } from "@/types/vehicle";

export function VehicleRentalCard({ rental }: { rental: ActiveRental | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Locação</CardTitle>
      </CardHeader>
      <CardContent>
        {rental ? (
          <Row as="dl" className="gap-y-4">
            <InfoItem span={6} label="Locatário">
              {rental.customer.name}
            </InfoItem>
            <InfoItem span={6} label="Código" mono>
              <TextLink to={routeTo.rental(rental.id)}>{rental.code}</TextLink>
            </InfoItem>
          </Row>
        ) : (
          <Text tone="muted">Nenhuma locação ativa neste veículo.</Text>
        )}
      </CardContent>
    </Card>
  );
}

export function VehicleRentalCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-20 text-base" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {["w-32", "w-24"].map((width) => (
            <Col key={width} span={6} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className={`${width} text-sm`} />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
