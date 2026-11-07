import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Text } from "@/components/atoms/text";
import type { LeadDetail } from "@/types/crm";

/** Why it was lost / why it was reopened. Lost reasons are never cleared. */
export function LeadLostCard({ lead }: { lead: LeadDetail }) {
  const hasLoss = lead.lostReasons.length > 0 || lead.lostReason;
  if (!hasLoss && !lead.reopenReason) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {hasLoss ? "Motivo da perda" : "Retomada"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lead.lostReasons.length > 0 && (
          <Box className="flex flex-wrap gap-1">
            {lead.lostReasons.map((reason) => (
              <Badge key={reason.code} variant="outline">
                {reason.label}
              </Badge>
            ))}
          </Box>
        )}
        {lead.lostReason && (
          <Text className="break-words">{lead.lostReason}</Text>
        )}
        {lead.reopenReason && (
          <Text tone="muted" className="break-words">
            Retomado porque: {lead.reopenReason}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}
