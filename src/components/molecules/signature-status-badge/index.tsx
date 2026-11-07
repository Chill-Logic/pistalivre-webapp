import { Badge } from "@/components/atoms/badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import {
  SIGNATURE_STATUS_VARIANT,
  SIGNER_STATUS_VARIANT,
} from "@/constants/signature";
import { useLabels } from "@/hooks/ui/useLabels";
import type { SignatureStatus, SignerStatus } from "@/types/signature";

export function SignatureStatusBadge({ status }: { status: SignatureStatus }) {
  const { label } = useLabels();
  return (
    <Badge variant={SIGNATURE_STATUS_VARIANT[status]}>
      {label(LABEL_MAPS.signatureStatus, status)}
    </Badge>
  );
}

export function SignerStatusBadge({ status }: { status: SignerStatus }) {
  const { label } = useLabels();
  return (
    <Badge variant={SIGNER_STATUS_VARIANT[status]}>
      {label(LABEL_MAPS.signerStatus, status)}
    </Badge>
  );
}
