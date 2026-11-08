import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import {
  CampaignLinkForm,
  CampaignLinkFormSkeleton,
} from "@/components/organisms/campaign-link-form";
import {
  CampaignLinkList,
  CampaignLinkListSkeleton,
} from "@/components/organisms/campaign-link-list";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { ROUTES } from "@/constants/routes";
import { useCampaignLinks } from "@/hooks/api/gestao/crm/useCampaignLinks";
import { useCrmOptions } from "@/hooks/api/gestao/crm/useCrmOptions";

/** CRM → links de campanha: one trackable link per channel. */
export function CrmLinksPage() {
  const options = useCrmOptions();
  const links = useCampaignLinks();

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.crm} label="CRM" />
      <PageHeader title="Links de campanha" />
      <QueryBoundary
        query={options}
        label="Carregando canais…"
        skeleton={<CampaignLinkFormSkeleton />}
      >
        {(data) => <CampaignLinkForm channels={data.channels ?? []} />}
      </QueryBoundary>
      <QueryBoundary
        query={links}
        label="Carregando links…"
        skeleton={<CampaignLinkListSkeleton />}
      >
        {(data) => <CampaignLinkList links={data} />}
      </QueryBoundary>
    </Box>
  );
}
