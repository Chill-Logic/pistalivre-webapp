import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { LeadStatusBadge } from "@/components/molecules/lead-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import { routeTo } from "@/constants/routes";
import type { LeadChainLink } from "@/types/crm";
import { formatDate } from "@/utils/format";

/**
 * Every loss and reopening of this person, oldest first. Reopening never
 * mutates a lead: it creates a copy, so the history stays intact.
 */
export function LeadChain({ chain }: { chain: LeadChainLink[] }) {
  if (chain.length < 2) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico de retomadas</CardTitle>
      </CardHeader>
      <CardContent>
        <List className="divide-y">
          {chain.map((link) => (
            <ListItem key={link.id} className="space-y-1 py-3">
              <Box className="flex items-center justify-between gap-2">
                <Text weight="medium">
                  {link.current ? (
                    "Este lead"
                  ) : (
                    <TextLink to={routeTo.lead(link.id)}>
                      Lead de {formatDate(link.createdAt)}
                    </TextLink>
                  )}
                </Text>
                <LeadStatusBadge status={link.status} />
              </Box>
              {link.reopenReason && (
                <Text size="xs" tone="muted">
                  Retomado: {link.reopenReason}
                </Text>
              )}
              {(link.lostReasons.length > 0 || link.lostReason) && (
                <Text size="xs" tone="muted">
                  Perdido:{" "}
                  {[
                    link.lostReasons.map((reason) => reason.label).join(", "),
                    link.lostReason,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
