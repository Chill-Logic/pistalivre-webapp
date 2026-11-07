import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";

type DashboardLayoutProps = {
  banner?: ReactNode;
  kpis: ReactNode;
  overdueByPurpose: ReactNode;
  topDebtors: ReactNode;
  funnel: ReactNode;
  leadSources: ReactNode;
  fleet: ReactNode;
  maintenanceTypes: ReactNode;
  monthlyActivity: ReactNode;
  monthlyCost: ReactNode;
  costByVehicle: ReactNode;
  services: ReactNode;
  ranking: ReactNode;
};

/** Grid shared by the dashboard and its skeleton: money, sales, fleet. */
export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <Box className="space-y-6">
      {props.banner}
      {props.kpis}
      <Row className="items-stretch gap-y-6">
        <Col lg={6}>{props.overdueByPurpose}</Col>
        <Col lg={6}>{props.topDebtors}</Col>
        <Col lg={6}>{props.funnel}</Col>
        <Col lg={6}>{props.leadSources}</Col>
        <Col lg={6}>{props.fleet}</Col>
        <Col lg={6}>{props.maintenanceTypes}</Col>
        <Col lg={6}>{props.monthlyActivity}</Col>
        <Col lg={6}>{props.monthlyCost}</Col>
        <Col lg={6}>{props.costByVehicle}</Col>
        <Col lg={6}>{props.services}</Col>
        <Col>{props.ranking}</Col>
      </Row>
    </Box>
  );
}
