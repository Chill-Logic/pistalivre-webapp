import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { PageHeader } from "@/components/molecules/page-header";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { AdminOnly } from "@/components/organisms/admin-only";
import { ListFooter } from "@/components/organisms/list-footer";
import { PartnerFilters } from "@/components/organisms/partner-filters";
import { PartnerList } from "@/components/organisms/partner-list";
import { PartnerTable } from "@/components/organisms/partner-table";
import { QueryError } from "@/components/organisms/query-error";
import { PARTNERS_ADMIN_ONLY } from "@/constants/partner";
import { ROUTES } from "@/constants/routes";
import { usePartnerList } from "@/hooks/api/gestao/partners/usePartners";
import { useListView } from "@/hooks/ui/useListView";
import { usePartnerFilters } from "@/hooks/ui/usePartnerFilters";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

export function PartnersPage() {
  const { isAdmin } = useUserPermissions();
  const { view, setView } = useListView();

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Parceiros"
        actions={
          isAdmin && (
            <>
              <ViewToggle view={view} onChange={setView} />
              <Button asChild>
                <Link to={ROUTES.partnerNew}>
                  <Plus />
                  Novo parceiro
                </Link>
              </Button>
            </>
          )
        }
      />
      <AdminOnly description={PARTNERS_ADMIN_ONLY}>
        <PartnersContent />
      </AdminOnly>
    </Box>
  );
}

function PartnersContent() {
  const { filters, setSearch, setActive, setPage, setPageSize } =
    usePartnerFilters();
  const { view, isDesktop } = useListView();
  const partners = usePartnerList(filters, isDesktop);

  return (
    <>
      <PartnerFilters
        filters={filters}
        onSearch={setSearch}
        onActiveChange={setActive}
      />
      {partners.isError ? (
        <QueryError error={partners.error} onRetry={() => partners.refetch()} />
      ) : view === "tabela" ? (
        <PartnerTable
          partners={partners.items}
          isLoading={partners.isPending}
          isRefreshing={partners.isRefreshing}
        />
      ) : (
        <PartnerList
          partners={partners.items}
          isLoading={partners.isPending}
          isRefreshing={partners.isRefreshing}
        />
      )}
      <ListFooter
        result={partners}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
}
