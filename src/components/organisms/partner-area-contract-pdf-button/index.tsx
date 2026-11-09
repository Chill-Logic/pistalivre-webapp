import { FileText } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { usePartnerContractDocument } from "@/hooks/api/parceiro/area/usePartnerContractDocument";

/** Opens the contract's PDF in a new tab (only when the contract has one). */
export function PartnerAreaContractPdfButton({
  contractId,
}: {
  contractId: string;
}) {
  const pdf = usePartnerContractDocument();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pdf.isPending}
      onClick={() => pdf.mutate(contractId)}
    >
      {pdf.isPending ? <Spinner /> : <FileText />}
      Contrato (PDF)
    </Button>
  );
}
