import { ClipboardList, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { SelectField } from "@/components/molecules/select-field";
import { LeadLostDialog } from "@/components/organisms/lead-lost-dialog";
import { LeadReopenDialog } from "@/components/organisms/lead-reopen-dialog";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLeadActions } from "@/hooks/api/gestao/crm/useLeadActions";
import { useLabels } from "@/hooks/ui/useLabels";
import type { CrmOptions, LeadDetail, LeadStatus } from "@/types/crm";

type LeadStageCardProps = { lead: LeadDetail; options: CrmOptions };

/**
 * Where the lead is in the funnel and what can happen next. LOST and WON are
 * terminal: the only way forward is reopening (a new attempt).
 */
export function LeadStageCard({ lead, options }: LeadStageCardProps) {
  const { label } = useLabels();
  const { status, questionnaire } = useLeadActions(lead.id);
  const [target, setTarget] = useState<LeadStatus>(lead.status);
  const [confirming, setConfirming] = useState(false);
  const terminal = lead.status === "LOST" || lead.status === "WON";
  const stageLabel = (code: string) => label(LABEL_MAPS.leadStatus, code);
  // A submitted or still-open questionnaire needs no new link.
  const canSendQuestionnaire =
    !terminal &&
    !lead.questionnaire?.submittedAt &&
    !lead.questionnaire?.link;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Andamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {terminal ? (
          <>
            <Text tone="muted">
              {lead.status === "WON"
                ? "Lead ganho. Ele fica como histórico; para uma nova venda, retome-o."
                : "Lead perdido. Ele fica como histórico; se voltar, retome-o."}
            </Text>
            <LeadReopenDialog
              leadId={lead.id}
              trigger={
                <Button variant="outline" className="w-full">
                  <RotateCcw />
                  Retomar
                </Button>
              }
            />
          </>
        ) : (
          <>
            <Box className="space-y-2">
              <SelectField
                label="Estágio"
                value={target}
                options={options.statuses.map((code) => ({
                  value: code,
                  label: stageLabel(code),
                }))}
                onChange={(value) => setTarget(value as LeadStatus)}
                disabled={status.isPending}
              />
              {target !== lead.status && (
                <ConfirmDialog
                  open={confirming}
                  onOpenChange={setConfirming}
                  trigger={
                    <Button className="w-full" disabled={status.isPending}>
                      {status.isPending && (
                        <Spinner className="text-primary-foreground" />
                      )}
                      Mover para {stageLabel(target)}
                    </Button>
                  }
                  title={`Mover para ${stageLabel(target)}?`}
                  description={
                    target === "WON"
                      ? "Ganho encerra o lead: ele não muda mais de estágio. Fica registrado na trilha."
                      : "A mudança fica registrada na trilha do lead."
                  }
                  confirmLabel="Mover"
                  isPending={status.isPending}
                  onConfirm={() =>
                    status.mutate(target, {
                      onSuccess: () => setConfirming(false),
                    })
                  }
                />
              )}
            </Box>
            <Box className="flex flex-col gap-2">
              {canSendQuestionnaire && (
                <Button
                  variant="outline"
                  disabled={questionnaire.isPending}
                  onClick={() => questionnaire.mutate()}
                >
                  {questionnaire.isPending ? <Spinner /> : <ClipboardList />}
                  Gerar link do questionário
                </Button>
              )}
              <LeadLostDialog
                leadId={lead.id}
                reasons={options.lostReasons}
                trigger={
                  <Button variant="outline" className="text-destructive">
                    <XCircle />
                    Marcar como perdido
                  </Button>
                }
              />
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function LeadStageCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-24 text-base" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Box className="space-y-2">
          <Skeleton shape="text" className="w-16 text-sm" />
          <Skeleton className="h-11 md:h-9" />
        </Box>
        <Skeleton className="h-11 md:h-9" />
        <Skeleton className="h-11 md:h-9" />
      </CardContent>
    </Card>
  );
}
