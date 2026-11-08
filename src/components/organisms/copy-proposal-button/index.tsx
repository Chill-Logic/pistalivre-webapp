import { Copy } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import {
  useCopyProposalText,
  type ProposalTextSource,
} from "@/hooks/api/gestao/proposals/useCopyProposalText";

type CopyProposalButtonProps = {
  source: ProposalTextSource;
  /** "icon" for tight rows (tables); the label goes to aria-label. */
  size?: "sm" | "icon";
  variant?: "outline" | "ghost";
};

/** "Copiar texto": the proposal ready to paste on WhatsApp. */
export function CopyProposalButton({
  source,
  size = "sm",
  variant = "outline",
}: CopyProposalButtonProps) {
  const copy = useCopyProposalText();
  const empty = "html" in source && !source.html.trim();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={copy.isPending || empty}
      onClick={() => copy.mutate(source)}
      aria-label={size === "icon" ? "Copiar texto da proposta" : undefined}
    >
      {copy.isPending ? <Spinner /> : <Copy />}
      {size !== "icon" && "Copiar texto"}
    </Button>
  );
}
