import { MessageSquareText } from "lucide-react";
import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { DocumentItem } from "@/components/molecules/document-item";
import { EmptyState } from "@/components/molecules/empty-state";
import { DocumentEditDialog } from "@/components/organisms/document-edit-dialog";
import { LABEL_MAPS } from "@/constants/label-maps";
import { queryKeys } from "@/constants/query-keys";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import { useLabels } from "@/hooks/ui/useLabels";
import type { LeadActivity } from "@/types/crm";
import { formatDateTime } from "@/utils/format";

type LeadActivitiesProps = {
  activities: LeadActivity[];
  /** With it, each attachment can be renamed (the lead query is refreshed). */
  leadId?: string;
  /** "Registrar atividade" button, next to the title. */
  action?: ReactNode;
};

/**
 * SDR trail, newest first, with each activity's attachments. A stage change
 * carries the new stage code.
 */
export function LeadActivities({
  activities,
  leadId,
  action,
}: LeadActivitiesProps) {
  const { label } = useLabels();
  const { view, download } = useFileActions();

  return (
    <Card>
      <CardHeader>
        <Box className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Atividades</CardTitle>
          {action}
        </Box>
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
                  <Box className="min-w-0 flex-1 space-y-0.5">
                    <Text weight="medium">
                      {label(LABEL_MAPS.leadActivity, activity.type)}
                    </Text>
                    {note && <Text className="break-words">{note}</Text>}
                    <Text size="xs" tone="muted">
                      {formatDateTime(activity.createdAt)}
                      {activity.createdByName && ` · ${activity.createdByName}`}
                    </Text>
                    {activity.documents.length > 0 && (
                      <Box className="divide-y pt-1">
                        {activity.documents.map((document) => (
                          <DocumentItem
                            key={document.id}
                            document={document}
                            onView={() => view.mutate(document)}
                            onDownload={() => download.mutate(document)}
                            isViewing={
                              view.isPending &&
                              view.variables?.id === document.id
                            }
                            isDownloading={
                              download.isPending &&
                              download.variables?.id === document.id
                            }
                            actions={
                              leadId && (
                                <DocumentEditDialog
                                  document={document}
                                  owner={{
                                    type: "LEAD_ACTIVITY",
                                    id: activity.id,
                                  }}
                                  invalidate={queryKeys.crm.lead(leadId)}
                                />
                              )
                            }
                          />
                        ))}
                      </Box>
                    )}
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
