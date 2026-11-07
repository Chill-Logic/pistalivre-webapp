import { AlertTriangle } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";

/** What still keeps a draft from being sent (computed by the API). */
export function SignatureBlockers({ blockers }: { blockers: string[] }) {
  return (
    <Alert variant="warning" role="status" className="space-y-2">
      <Box className="flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        <Text inline size={null} weight="medium">
          Falta isto para poder solicitar a assinatura
        </Text>
      </Box>
      <List className="list-inside list-disc space-y-1 text-sm">
        {blockers.map((blocker) => (
          <ListItem key={blocker}>{blocker}</ListItem>
        ))}
      </List>
    </Alert>
  );
}
