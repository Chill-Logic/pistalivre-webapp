import { FileText } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { ProposalComposer } from "@/components/organisms/proposal-composer";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { useLead } from "@/hooks/api/gestao/crm/useLead";
import { useProposalTemplates } from "@/hooks/api/gestao/proposals/useProposalMutations";

/**
 * "Emitir proposta de locação": 1) choose the template, 2) the composer.
 * `?lead=` comes from a CRM lead (its contact feeds the proposal); without
 * it the proposal is standalone. `?modelo=` = the chosen template.
 */
export function ProposalNewPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const leadId = params.get("lead") ?? "";
  const templateId = params.get("modelo") ?? "";
  const templates = useProposalTemplates();
  const lead = useLead(leadId);
  const backTo = leadId ? routeTo.lead(leadId) : ROUTES.proposals;
  const template = templates.data?.find((item) => item.id === templateId);

  const choose = (id: string) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set("modelo", id);
      return next;
    });

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label={leadId ? "Lead" : "Propostas"} />
      <PageHeader title="Emitir proposta de locação" />
      {(templates.isPending || (leadId && lead.isPending)) && (
        <SkeletonRegion label="Carregando modelos…">
          <ProposalTemplatesSkeleton />
        </SkeletonRegion>
      )}
      {templates.isError && (
        <QueryError
          error={templates.error}
          onRetry={() => templates.refetch()}
        />
      )}
      {templates.data && !template && (!leadId || lead.data) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Escolha o modelo</CardTitle>
          </CardHeader>
          <CardContent>
            {templates.data.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Nenhum modelo de proposta ativo"
                description="Crie um modelo de proposta na gestão antes de emitir."
              />
            ) : (
              <List className="space-y-2">
                {templates.data.map((item) => (
                  <ListItem key={item.id}>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => choose(item.id)}
                    >
                      <FileText />
                      {item.name}
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}
      {template && (!leadId || lead.data) && (
        <>
          <Box className="flex flex-wrap items-center gap-2">
            <Button asChild variant="link" size="sm" className="px-0">
              <Link
                to={`${ROUTES.proposalNew}${leadId ? `?lead=${encodeURIComponent(leadId)}` : ""}`}
              >
                Modelo: {template.name} · trocar
              </Link>
            </Button>
          </Box>
          <ProposalComposer
            key={template.id}
            template={template}
            lead={lead.data ? { id: lead.data.id, name: lead.data.name } : null}
            cancelTo={backTo}
            onIssued={(proposal) =>
              navigate(routeTo.proposal(proposal.id), { replace: true })
            }
          />
        </>
      )}
    </Box>
  );
}

function ProposalTemplatesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-40 text-base" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </CardContent>
    </Card>
  );
}
