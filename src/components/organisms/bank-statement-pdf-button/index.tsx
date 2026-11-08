import { FileText } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { useBankStatementPdf } from "@/hooks/api/gestao/finance/useStatementExportMutations";

/**
 * The OFFICIAL Inter statement (the PDF the accountant reconciles by
 * account) for the screen's period; the bank's error shows as a toast.
 */
export function BankStatementPdfButton({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  const pdf = useBankStatementPdf();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pdf.isPending}
      onClick={() => pdf.mutate({ start, end })}
    >
      {pdf.isPending ? <Spinner /> : <FileText />}
      PDF oficial do banco
    </Button>
  );
}
