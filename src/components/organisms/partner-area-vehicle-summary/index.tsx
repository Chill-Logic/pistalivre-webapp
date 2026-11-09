import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { InfoItem } from "@/components/molecules/info-item";
import { PartnerVehicleStatusBadge } from "@/components/molecules/partner-area-status-badge";
import { periodText } from "@/helpers/partner-area";
import type { PartnerAreaVehicleDetail } from "@/types/partner-area";
import { formatPlate } from "@/utils/plate";

/** The vehicle and when it was (or is) in the partner's contract. */
export function PartnerAreaVehicleSummary({
  detail,
}: {
  detail: PartnerAreaVehicleDetail;
}) {
  const { vehicle, windows } = detail;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dados do veículo</CardTitle>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem label="Placa" span={6} md={2} mono>
            {formatPlate(vehicle.plate)}
          </InfoItem>
          <InfoItem label="Ano" span={6} md={2}>
            {vehicle.year}
          </InfoItem>
          <InfoItem label="Cor" span={6} md={2}>
            {vehicle.color}
          </InfoItem>
          <InfoItem label="Situação" span={6} md={2}>
            <PartnerVehicleStatusBadge status={vehicle.status} />
          </InfoItem>
          <InfoItem label="No seu contrato" span={12} md={4}>
            {windows.length === 0 ? null : (
              <List className="space-y-0.5">
                {windows.map((window) => (
                  <ListItem key={window.from}>
                    {periodText(window.from, window.to)}
                  </ListItem>
                ))}
              </List>
            )}
          </InfoItem>
        </Row>
      </CardContent>
    </Card>
  );
}

export function PartnerAreaVehicleSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {["w-20", "w-12", "w-16", "w-16"].map((width, index) => (
            <Col key={index} span={6} md={2} className="space-y-2">
              <Skeleton shape="text" className="w-12 text-xs" />
              <Skeleton shape="text" className={`${width} text-sm`} />
            </Col>
          ))}
          <Col md={4} className="space-y-2">
            <Skeleton shape="text" className="w-24 text-xs" />
            <Box>
              <Skeleton shape="text" className="w-32 text-sm" />
            </Box>
          </Col>
        </Row>
      </CardContent>
    </Card>
  );
}
