import { Copy } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { CodeBlock } from "@/components/atoms/code-block";
import { useCopy } from "@/hooks/ui/useCopy";

type CopyCodeProps = {
  code: string;
  /** Toast after copying. */
  copied?: string;
};

/** A command or address to paste somewhere, with a copy button on top of it. */
export function CopyCode({ code, copied = "Copiado" }: CopyCodeProps) {
  const copy = useCopy();
  return (
    <Box className="relative">
      <CodeBlock className="pr-12">{code}</CodeBlock>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Copiar"
        className="absolute right-1 top-1"
        onClick={() => copy(code, copied)}
      >
        <Copy />
      </Button>
    </Box>
  );
}
