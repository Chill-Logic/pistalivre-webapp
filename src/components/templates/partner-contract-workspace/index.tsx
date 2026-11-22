import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { SegmentedControl } from "@/components/atoms/segmented-control";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

/** "termos", "contrato" or one tab per document that goes with it (`termo-<instrumentId>`). */
export type PartnerContractTab = "termos" | "contrato" | `termo-${string}`;

/** A document that goes with the contract, as a tab of its own. */
export type PartnerContractTermTab = {
  value: `termo-${string}`;
  /** On the desktop ("Termo de aporte", "Aditivo de reajuste"). */
  title: string;
  /** Its whole name, in the tooltip ("Termo de reconhecimento de aporte…"). */
  fullTitle: string;
  /** On the phone ("Aporte"; a custom name is truncated, the whole one in the tooltip). */
  shortTitle: string;
  content: ReactNode;
};

const FIXED_TABS: { value: PartnerContractTab; label: ReactNode }[] = [
  { value: "termos", label: "Termos" },
  { value: "contrato", label: "Contrato" },
];

function termLabel(term: PartnerContractTermTab) {
  return (
    <>
      <Text inline size={null} title={term.fullTitle} className="block min-w-0 truncate sm:hidden">
        {term.shortTitle}
      </Text>
      <Text inline size={null} title={term.fullTitle} className="hidden min-w-0 truncate sm:block">
        {term.title}
      </Text>
    </>
  );
}

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
  /** The documents that go with the contract, one tab each, after "Contrato". */
  terms?: PartnerContractTermTab[];
  /** Beside the tabs: "Incluir termo" (absent when nothing can be added). */
  addTerm?: ReactNode;
  /** The Livrinho, the SAME on every tab (absent without AI). */
  chat?: ReactNode;
};

/**
 * The partner contract's workspace, in tabs: "Termos", "Contrato" and one per
 * document that goes with it. Desktop: the chat stays in its own column on
 * the right (one conversation for every tab); "Termos" has the form and the
 * calculator side by side on wide screens (3 columns in all, from 1536px;
 * below, the calculator goes under the form). Every tab stays mounted
 * (hidden, not unmounted): switching never loses what was typed. Phone: the
 * tabs on top (sliding sideways when there are many) and the Livrinho as a
 * button + sheet.
 */
export function PartnerContractWorkspace({
  header,
  tab,
  onTabChange,
  notices,
  form,
  calculator,
  contract,
  terms = [],
  addTerm,
  chat,
}: PartnerContractWorkspaceProps) {
  const tabs = [
    ...FIXED_TABS,
    ...terms.map((term) => ({ value: term.value, label: termLabel(term) })),
  ];
  // Phone: the tabs slide sideways; the open one is brought into view (a link to a term's tab).
  const scroller = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const track = scroller.current;
    const chosen = track?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
    if (!track || !chosen || track.scrollWidth <= track.clientWidth) return;
    track.scrollLeft = chosen.offsetLeft - (track.clientWidth - chosen.offsetWidth) / 2;
  }, [tab]);
  // Equal segments: ~6.5rem each on the phone (slides sideways past 3), ~10rem on the desktop.
  const sizing = { "--tabs": tabs.length } as CSSProperties;
  return (
    <Box className="space-y-4">
      {header}
      {notices}
      <Box className="flex items-center gap-2">
        <Box
          ref={scroller}
          style={sizing}
          className="-my-1 min-w-0 flex-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <SegmentedControl
            value={tab}
            onValueChange={onTabChange}
            options={tabs}
            aria-label="Parte do contrato"
            className={cn(
              "w-full",
              tabs.length > 3 && "min-w-[calc(var(--tabs)*6.5rem)] sm:min-w-0",
              "sm:w-[min(100%,calc(var(--tabs)*10rem))]",
            )}
          />
        </Box>
        {addTerm && <Box className="shrink-0">{addTerm}</Box>}
      </Box>
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
          {terms.map((term) => (
            <Box key={term.value} className={cn(tab !== term.value && "hidden")}>
              {term.content}
            </Box>
          ))}
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
