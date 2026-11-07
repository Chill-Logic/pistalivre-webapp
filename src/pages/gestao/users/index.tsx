import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { QueryError } from "@/components/organisms/query-error";
import { UserFilters } from "@/components/organisms/user-filters";
import { UserList } from "@/components/organisms/user-list";
import { useUsers } from "@/hooks/api/gestao/users/useUsers";
import { useUserFilters } from "@/hooks/ui/useUserFilters";

export function UsersPage() {
  const { filters, setSearch, setRole } = useUserFilters();
  const users = useUsers(filters);

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Usuários" />
      <UserFilters
        filters={filters}
        onSearch={setSearch}
        onRoleChange={setRole}
      />
      {users.isError ? (
        <QueryError error={users.error} onRetry={() => users.refetch()} />
      ) : (
        <UserList
          users={users.data}
          isLoading={users.isPending}
          isRefreshing={users.isPlaceholderData}
        />
      )}
    </Box>
  );
}
