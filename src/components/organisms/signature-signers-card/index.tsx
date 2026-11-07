import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { SignerStatusBadge } from "@/components/molecules/signature-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Signer } from "@/types/signature";
import { formatCpf, formatPhone } from "@/utils/document";
import { formatDateTime } from "@/utils/format";

/** Who signs, in signing order (same order = in parallel), with status. */
export function SignatureSignersCard({ signers }: { signers: Signer[] }) {
  const { label } = useLabels();
  const ordered = [...signers].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Signatários</CardTitle>
      </CardHeader>
      <CardContent>
        {ordered.length === 0 ? (
          <Text tone="muted">Nenhum signatário adicionado.</Text>
        ) : (
          <List className="divide-y">
            {ordered.map((signer) => {
              const href = signer.customerId
                ? routeTo.customer(signer.customerId)
                : signer.userId
                  ? routeTo.user(signer.userId)
                  : null;
              const contact = [
                signer.email,
                signer.phone && formatPhone(signer.phone),
                signer.documentation &&
                  `CPF ${formatCpf(signer.documentation)}`,
              ].filter(Boolean);
              return (
                <ListItem key={signer.id} className="space-y-1 py-3">
                  <Box className="flex items-start justify-between gap-2">
                    <Text weight="medium" className="min-w-0 break-words">
                      {href ? (
                        <TextLink to={href}>{signer.name}</TextLink>
                      ) : (
                        signer.name
                      )}
                    </Text>
                    <SignerStatusBadge status={signer.status} />
                  </Box>
                  <Text size="xs" tone="muted">
                    {signer.order}º · {label(LABEL_MAPS.signerRole, signer.role)}{" "}
                    · aviso por {label(LABEL_MAPS.signerChannel, signer.notify)}
                  </Text>
                  <Text size="xs" tone="muted" className="break-words">
                    {contact.join(" · ")}
                  </Text>
                  {signer.signedAt && (
                    <Text size="xs" tone="muted">
                      Assinou em {formatDateTime(signer.signedAt)}
                    </Text>
                  )}
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export function SignatureSignersCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent className="divide-y">
        {[0, 1].map((index) => (
          <Box key={index} className="space-y-2 py-3">
            <Box className="flex items-start justify-between gap-2">
              <Skeleton shape="text" className="w-40 text-sm" />
              <Skeleton shape="pill" className="h-5 w-16" />
            </Box>
            <Skeleton shape="text" className="w-48 text-xs" />
            <Skeleton shape="text" className="w-56 text-xs" />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
