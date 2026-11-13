import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { SegmentedControl } from "@/components/atoms/segmented-control";
import { cn } from "@/utils/cn";

export type PartnerContractTab = "termos" | "contrato";

const TABS = [
  { value: "termos" as const, label: "Termos" },
  { value: "contrato" as const, label: "Contrato" },
];

type PartnerContractWorkspaceProps = {
  header: ReactNode;
  tab: PartnerContractTab;
  onTabChange: (tab: PartnerContractTab) => void;
  /** Notices above the tabs (locked, no vehicles…). */
  notices?: ReactNode;
  /** "Termos": the form… */
  form: ReactNode;
  /** …with the calculator beside it. */
  calculator: ReactNode;
  /** "Contrato": the text (a preview before saving, the living draft after). */
  contract: ReactNode;
  /** The Livrinho, the SAME on both tabs (absent without AI). */
  chat?: ReactNode;
};

/**
 * The partner contract's workspace, in two tabs. Desktop: the chat stays in
 * its own column on the right (one conversation for both tabs); "Termos" has
 * the form and the calculator side by side on wide screens (3 columns in all, from 1536px; below, the calculator goes under the form), "Contrato" the
 * text. Both tabs stay mounted (hidden, not unmounted): switching never loses
 * what was typed. Phone: the tabs on top and the Livrinho as a button + sheet.
 */
export function PartnerContractWorkspace({
  header,
  tab,
  onTabChange,
  notices,
  form,
  calculator,
  contract,
  chat,
}: PartnerContractWorkspaceProps) {
  return (
    <Box className="space-y-4">
      {header}
      {notices}
      <SegmentedControl
        value={tab}
        onValueChange={onTabChange}
        options={TABS}
        aria-label="Parte do contrato"
        className="w-full sm:w-80"
      />
      <Row className="items-start gap-y-4">
        <Col lg={chat ? 8 : 12} className="order-2 lg:order-1">
          <Box className={cn(tab !== "termos" && "hidden")}>
            <Row className="items-start gap-y-4">
              <Col xxl={7}>{form}</Col>
              <Col xxl={5} className="2xl:sticky 2xl:top-20">
                {calculator}
              </Col>
            </Row>
          </Box>
          <Box className={cn(tab !== "contrato" && "hidden")}>{contract}</Box>
        </Col>
        {chat && (
          // Stretched to the row's height: the chat card sticks while the page scrolls
          // (a column as tall as the card itself gives "sticky" no room).
          <Col lg={4} className="order-1 lg:order-2 lg:self-stretch">
            {chat}
          </Col>
        )}
      </Row>
    </Box>
  );
}
