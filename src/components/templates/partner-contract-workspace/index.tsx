import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { SegmentedControl } from "@/components/atoms/segmented-control";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

export type PartnerContractTab = "termos" | "contrato" | "termo-de-aporte";

const TABS: { value: PartnerContractTab; label: ReactNode }[] = [
  { value: "termos", label: "Termos" },
  { value: "contrato", label: "Contrato" },
];
// Phone: three tabs side by side leave no room for the whole name.
const TERM_TAB = {
  value: "termo-de-aporte" as const,
  label: (
    <>
      <Text inline size={null} className="sm:hidden">
        Aporte
      </Text>
      <Text inline size={null} className="hidden sm:inline">
        Termo de aporte
      </Text>
    </>
  ),
};

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
  /** "Termo de aporte" (investment only): the third tab, absent otherwise. */
  term?: ReactNode;
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
  term,
  chat,
}: PartnerContractWorkspaceProps) {
  const tabs = term ? [...TABS, TERM_TAB] : TABS;
  return (
    <Box className="space-y-4">
      {header}
      {notices}
      <SegmentedControl
        value={tab}
        onValueChange={onTabChange}
        options={tabs}
        aria-label="Parte do contrato"
        className={cn("w-full", term ? "sm:w-[30rem]" : "sm:w-80")}
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
          {term && (
            <Box className={cn(tab !== "termo-de-aporte" && "hidden")}>{term}</Box>
          )}
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
