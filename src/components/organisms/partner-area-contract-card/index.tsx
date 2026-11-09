import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import {
  CostPayerList,
  CostPayerListSkeleton,
} from "@/components/molecules/cost-payer-list";
import { InfoItem } from "@/components/molecules/info-item";
import {
  PartnerContractStatusBadge,
  PartnerVehicleStatusBadge,
} from "@/components/molecules/partner-area-status-badge";
import {
  PartnerAreaVehicleItem,
  PartnerAreaVehicleItemSkeleton,
} from "@/components/molecules/partner-area-vehicle-item";
import { PartnerAreaContractPdfButton } from "@/components/organisms/partner-area-contract-pdf-button";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { offerRateText } from "@/helpers/partner";
import { contractTerms, periodText } from "@/helpers/partner-area";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerAreaContract } from "@/types/partner-area";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";
import { pluralize } from "@/utils/text";

const TABLE_HEADERS = [
  "Veículo",
  "Situação",
  "Aquisição",
  "Locação oferecida",
  "No contrato",
  "Locação atual",
];

const RIGHT = ["Aquisição", "Locação oferecida"];

const LINK_CLASS =
  "rounded-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * One contract of the partner: its terms, then its vehicles — cards on
 * the phone, a table on the desktop — each with the current rental.
 */
export function PartnerAreaContractCard({
  contract,
}: {
  contract: PartnerAreaContract;
}) {
  const { label } = useLabels();
  const terms = contractTerms(contract, label);

  return (
    <Card>
      <CardHeader className="gap-2 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <Box className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">
            {label(LABEL_MAPS.partnerContractType, contract.type)}
          </CardTitle>
          <Text inline size="xs" tone="muted" mono>
            {contract.code}
          </Text>
        </Box>
        <Box className="flex flex-wrap items-center gap-2">
          <PartnerContractStatusBadge status={contract.status} />
          {contract.hasDocument && (
            <PartnerAreaContractPdfButton contractId={contract.id} />
          )}
        </Box>
      </CardHeader>
      <CardContent className="space-y-6">
        <Row as="dl" className="gap-y-4">
          <InfoItem label="Vigência" span={6} md={3}>
            {periodText(contract.startDate, contract.endDate)}
          </InfoItem>
          {terms.map((term) => (
            <InfoItem key={term.label} label={term.label} span={6} md={3}>
              {term.value}
            </InfoItem>
          ))}
          <InfoItem label="Quem paga as despesas">
            <CostPayerList costs={contract.costs} />
          </InfoItem>
        </Row>
        {!contract.hasDocument && (
          <Text size="xs" tone="muted">
            O contrato em PDF ainda não foi disponibilizado.
          </Text>
        )}

        <Box className="space-y-3">
          <Heading level={2} variant="section">
            {pluralize(contract.vehicles.length, "veículo", "veículos")}
          </Heading>
          {contract.vehicles.length === 0 ? (
            <Text tone="muted">Nenhum veículo neste contrato.</Text>
          ) : (
            <>
              <List className="space-y-3 md:hidden">
                {contract.vehicles.map((vehicle) => (
                  <ListItem key={vehicle.vehicleId}>
                    <PartnerAreaVehicleItem vehicle={vehicle} />
                  </ListItem>
                ))}
              </List>
              <Box className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {TABLE_HEADERS.map((header) => (
                        <TableHead
                          key={header}
                          className={
                            RIGHT.includes(header) ? "text-right" : undefined
                          }
                        >
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contract.vehicles.map((vehicle) => (
                      <TableRow key={vehicle.vehicleId}>
                        <TableCell className="whitespace-normal">
                          <Link
                            to={routeTo.partnerAreaVehicle(vehicle.vehicleId)}
                            className={LINK_CLASS}
                          >
                            {vehicle.label ?? "Veículo"}
                          </Link>
                          <Text size="xs" tone="muted">
                            {vehicle.plate ? formatPlate(vehicle.plate) : "—"}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <PartnerVehicleStatusBadge status={vehicle.status} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {vehicle.acquisitionValue !== null
                            ? formatCurrency(vehicle.acquisitionValue)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {offerRateText(
                            vehicle.offerRate,
                            vehicle.offerRatePeriod,
                          ) ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {periodText(vehicle.joinedAt, vehicle.leftAt)}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {vehicle.currentRental ? (
                            <>
                              <Link
                                to={routeTo.partnerAreaRental(
                                  vehicle.currentRental.id,
                                )}
                                className={LINK_CLASS}
                              >
                                {vehicle.currentRental.customerName}
                              </Link>
                              <Text size="xs" tone="muted">
                                Desde{" "}
                                {formatCalendarDate(
                                  vehicle.currentRental.visibleFrom,
                                )}
                              </Text>
                            </>
                          ) : (
                            <Text inline tone="muted">
                              Sem locação
                            </Text>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export function PartnerAreaContractCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <Box className="flex items-center gap-2">
          <Skeleton shape="text" className="w-28 text-base" />
          <Skeleton shape="text" className="w-24 text-xs" />
        </Box>
        <Skeleton shape="pill" className="h-5 w-14" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Row className="gap-y-4">
          {["w-28", "w-32", "w-24", "w-20"].map((width, index) => (
            <Col key={index} span={6} md={3} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className={`${width} text-sm`} />
            </Col>
          ))}
          <Col className="space-y-2">
            <Skeleton shape="text" className="w-36 text-xs" />
            <CostPayerListSkeleton />
          </Col>
        </Row>
        <Box className="space-y-3">
          <Skeleton shape="text" className="w-16 text-base" />
          <Box className="space-y-3 md:hidden">
            <PartnerAreaVehicleItemSkeleton />
            <PartnerAreaVehicleItemSkeleton />
          </Box>
          <Box className="hidden space-y-px overflow-hidden rounded-lg border md:block">
            {[0, 1, 2].map((row) => (
              <Box key={row} className="flex items-center gap-6 px-4 py-3">
                <Skeleton shape="text" className="w-48 text-sm" />
                <Skeleton shape="pill" className="h-5 w-16" />
                <Skeleton shape="text" className="w-20 text-sm" />
                <Skeleton shape="text" className="w-28 text-sm" />
                <Skeleton shape="text" className="w-28 text-sm" />
                <Skeleton shape="text" className="w-36 text-sm" />
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
