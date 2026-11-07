import { MessageSquareText } from "lucide-react";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { LeadActivity } from "@/types/crm";
import { formatDateTime } from "@/utils/format";

/** SDR trail, newest first. A stage change carries the new stage code. */
export function LeadActivities({ activities }: { activities: LeadActivity[] }) {
  const { label } = useLabels();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="Nenhuma atividade ainda"
          />
        ) : (
          <List className="space-y-4">
            {activities.map((activity) => {
              const isStage = activity.type === "STATUS_CHANGE";
              const note =
                isStage && activity.note
                  ? `Moveu para ${label(LABEL_MAPS.leadStatus, activity.note)}`
                  : activity.note;
              return (
                <ListItem key={activity.id} className="flex gap-3">
                  <Box
                    aria-hidden
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                  />
                  <Box className="min-w-0 space-y-0.5">
                    <Text weight="medium">
                      {label(LABEL_MAPS.leadActivity, activity.type)}
                    </Text>
                    {note && <Text className="break-words">{note}</Text>}
                    <Text size="xs" tone="muted">
                      {formatDateTime(activity.createdAt)}
                      {activity.createdByName && ` · ${activity.createdByName}`}
                    </Text>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
