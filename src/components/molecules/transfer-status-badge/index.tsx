import { Badge } from "@/components/atoms/badge";
import { TRANSFER_STATUS } from "@/constants/transfer";
import type { TransferStatus } from "@/types/transfer";

export function TransferStatusBadge({ status }: { status: TransferStatus }) {
  const { label, variant } = TRANSFER_STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
