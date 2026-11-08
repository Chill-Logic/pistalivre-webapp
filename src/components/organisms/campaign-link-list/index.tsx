import { Link2 } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import {
  CampaignLinkCard,
  CampaignLinkCardSkeleton,
} from "@/components/molecules/campaign-link-card";
import { EmptyState } from "@/components/molecules/empty-state";
import { CampaignLinkActions } from "@/components/organisms/campaign-link-actions";
import type { CampaignLink } from "@/types/crm";

/** The links created, newest first (as the API sends them). */
export function CampaignLinkList({ links }: { links: CampaignLink[] }) {
  if (links.length === 0) {
    return (
      <EmptyState
        icon={Link2}
        title="Nenhum link de campanha"
        description="Crie um link por canal de divulgação: ele leva os UTMs que dizem de onde cada lead veio."
      />
    );
  }
  return (
    <Row as="ul" className="gap-y-6">
      {links.map((link) => (
        <Col as="li" key={link.id} lg={6}>
          <CampaignLinkCard
            link={link}
            actions={<CampaignLinkActions link={link} />}
          />
        </Col>
      ))}
    </Row>
  );
}

export function CampaignLinkListSkeleton() {
  return (
    <Row className="gap-y-6">
      {[0, 1].map((index) => (
        <Col key={index} lg={6}>
          <CampaignLinkCardSkeleton />
        </Col>
      ))}
    </Row>
  );
}
