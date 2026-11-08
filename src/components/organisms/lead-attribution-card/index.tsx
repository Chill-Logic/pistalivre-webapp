import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Row } from "@/components/atoms/grid";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { hasTouchData, touchChannel } from "@/helpers/crm";
import type { LeadDetail, Touch } from "@/types/crm";
import { formatDateTime } from "@/utils/format";

/**
 * Where the lead came from: the first and the last touch (utm, referrer,
 * landing page and when), plus the campaign link it arrived by.
 */
export function LeadAttributionCard({ lead }: { lead: LeadDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atribuição</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <TouchDetails title="Primeiro toque" touch={lead.first} />
        <TouchDetails title="Último toque" touch={lead.last} />
        {lead.campaignLabel && (
          <Text size="sm" tone="muted" className="break-words">
            Link: {lead.campaignLabel}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

function TouchDetails({ title, touch }: { title: string; touch: Touch }) {
  return (
    <Row as="dl" className="gap-y-3">
      <InfoItem label={title}>
        {hasTouchData(touch) ? touchChannel(touch) : "Direto (sem dados)"}
      </InfoItem>
      {hasTouchData(touch) && (
        <>
          <InfoItem span={6} label="Campanha">
            {touch.utmCampaign}
          </InfoItem>
          <InfoItem span={6} label="Conteúdo">
            {touch.utmContent}
          </InfoItem>
          {touch.referrer && (
            <InfoItem label="Veio de (referrer)" mono>
              <Text inline size="xs" className="break-all">
                {touch.referrer}
              </Text>
            </InfoItem>
          )}
          {touch.landing && (
            <InfoItem label="Página de entrada" mono>
              <Text inline size="xs" className="break-all">
                {touch.landing}
              </Text>
            </InfoItem>
          )}
          {touch.touchAt && (
            <InfoItem label="Quando">{formatDateTime(touch.touchAt)}</InfoItem>
          )}
        </>
      )}
    </Row>
  );
}
