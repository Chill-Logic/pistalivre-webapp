import { Link } from "react-router-dom";
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
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { visiblePeriodText } from "@/helpers/partner-area";
import { rateLabel } from "@/helpers/rental";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerAreaRentalDetail } from "@/types/partner-area";
import { formatPlate } from "@/utils/plate";

/** Who rents (the name only), which vehicle, the visible period and rate. */
export function PartnerAreaRentalSummary({
  rental,
}: {
  rental: PartnerAreaRentalDetail["rental"];
}) {
  const { label } = useLabels();
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Locação</CardTitle>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem label="Cliente" span={12}>
            {rental.customerName}
          </InfoItem>
          <InfoItem label="Código" span={12} mono>
            {rental.code}
          </InfoItem>
          <InfoItem label="Veículo" span={12}>
            <Link
              to={routeTo.partnerAreaVehicle(rental.vehicleId)}
              className="rounded-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {rental.vehicleLabel ?? "Veículo"}
            </Link>
            {rental.plate && (
              <Text size="xs" tone="muted" mono>
                {formatPlate(rental.plate)}
              </Text>
            )}
          </InfoItem>
          <InfoItem label="No seu período" span={12}>
            {visiblePeriodText(rental.visibleFrom, rental.visibleTo)}
          </InfoItem>
          <InfoItem label="Valor" span={12}>
            {rateLabel(
              rental.rate,
              label(LABEL_MAPS.ratePeriod, rental.ratePeriod),
            )}
          </InfoItem>
        </Row>
      </CardContent>
    </Card>
  );
}

export function PartnerAreaRentalSummarySkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton shape="text" className="w-20 text-base" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {["w-40", "w-28", "w-48", "w-36", "w-32"].map((width) => (
            <Col key={width} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className={`${width} text-sm`} />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
