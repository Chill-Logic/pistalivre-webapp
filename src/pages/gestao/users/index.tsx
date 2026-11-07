import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryError } from "@/components/organisms/query-error";
import { UserFilters } from "@/components/organisms/user-filters";
import { UserList } from "@/components/organisms/user-list";
import { UserTable } from "@/components/organisms/user-table";
import { useUserList } from "@/hooks/api/gestao/users/useUsers";
import { useListView } from "@/hooks/ui/useListView";
import { useUserFilters } from "@/hooks/ui/useUserFilters";

export function UsersPage() {
  const { filters, setSearch, setRole, setPage, setPageSize } =
    useUserFilters();
  const { view, setView, isDesktop } = useListView();
  const users = useUserList(filters, isDesktop);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Usuários"
        actions={<ViewToggle view={view} onChange={setView} />}
      />
      <UserFilters
        filters={filters}
        onSearch={setSearch}
        onRoleChange={setRole}
      />
      {users.isError ? (
        <QueryError error={users.error} onRetry={() => users.refetch()} />
      ) : view === "tabela" ? (
        <UserTable
          users={users.items}
          isLoading={users.isPending}
          isRefreshing={users.isRefreshing}
        />
      ) : (
        <UserList
          users={users.items}
          isLoading={users.isPending}
          isRefreshing={users.isRefreshing}
        />
      )}
      <ListFooter
        result={users}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
