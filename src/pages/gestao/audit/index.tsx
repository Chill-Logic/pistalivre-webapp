import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { AiAuditDetail } from "@/components/organisms/ai-audit-detail";
import { AiAuditFilters } from "@/components/organisms/ai-audit-filters";
import { AiAuditList } from "@/components/organisms/ai-audit-list";
import { AiAuditTable } from "@/components/organisms/ai-audit-table";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryError } from "@/components/organisms/query-error";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import { useAiAudit, useAiClients, useAiPermissions } from "@/hooks/api/gestao/ai/useAi";
import { useAiAuditFilters } from "@/hooks/ui/useAiAuditFilters";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

/**
 * Auditoria (admin only): everything the AIs did in the system — the chat,
 * every MCP request and tool call (input and output in full), the OAuth
 * events and the admin's permission changes.
 */
export function AuditPage() {
  const { isAdmin } = useUserPermissions();
  if (!isAdmin) {
    return (
      <Box className="space-y-4 md:space-y-6">
        <PageHeader title="Auditoria" />
        <EmptyState icon={ShieldAlert} title="Só administradores" description="A auditoria é visível só para administradores." />
      </Box>
    );
  }
  return <AuditContent />;
}

function AuditContent() {
  const { filters, values, setFilter, setPage, setPageSize } = useAiAuditFilters();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const audit = useAiAudit(filters, isDesktop);
  const permissions = useAiPermissions();
  const clients = useAiClients();
  const [openId, setOpenId] = useState<string | null>(null);
  const titles = new Map((permissions.data?.tools ?? []).map((t) => [t.name, t.title]));
  const toolTitle = (name: string) => titles.get(name) ?? name;

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Auditoria" />
      <AiAuditFilters
        values={values}
        onChange={setFilter}
        people={permissions.data?.users ?? []}
        tools={permissions.data?.tools ?? []}
        clients={clients.data ?? []}
      />
      {audit.isError ? (
        <QueryError error={audit.error} onRetry={() => audit.refetch()} />
      ) : !audit.isPending && audit.total === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nada registrado com esses filtros"
          description="Cada uso da IA no sistema (chat, MCP e autorizações) aparece aqui."
        />
      ) : audit.mode === "pages" ? (
        <AiAuditTable
          entries={audit.items}
          isLoading={audit.isPending}
          isRefreshing={audit.isRefreshing}
          onOpen={setOpenId}
          toolTitle={toolTitle}
        />
      ) : (
        <AiAuditList
          entries={audit.items}
          isLoading={audit.isPending}
          isRefreshing={audit.isRefreshing}
          onOpen={setOpenId}
          toolTitle={toolTitle}
        />
      )}
      <ListFooter result={audit} onPageChange={setPage} onPageSizeChange={setPageSize} />
      <AiAuditDetail id={openId} onClose={() => setOpenId(null)} toolTitle={toolTitle} />
    </Box>
  );
}
