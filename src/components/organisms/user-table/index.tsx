import { useMemo } from "react";
import { UserCog } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { useLabels } from "@/hooks/ui/useLabels";
import type { StaffUser } from "@/types/user";
import { formatDate, formatDateTime } from "@/utils/format";

type UserTableProps = {
  users: StaffUser[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the user list (same props as UserList). */
export function UserTable({ users, isLoading, isRefreshing }: UserTableProps) {
  const { label } = useLabels();

  const columns = useMemo<DataTableColumn<StaffUser>[]>(
    () => [
      {
        header: "Nome",
        cell: (user) => (
          <Text inline size={null} weight="semibold">
            {user.name}
          </Text>
        ),
        className: "max-w-56 truncate",
        skeleton: "w-36",
      },
      {
        header: "E-mail",
        cell: (user) => user.email,
        className: "max-w-64 truncate",
        skeleton: "w-44",
      },
      {
        header: "Perfil",
        cell: (user) => (
          <Badge variant={user.role === "ADMIN" ? "neutral" : "outline"}>
            {label(LABEL_MAPS.userRole, user.role)}
          </Badge>
        ),
        skeletonShape: "pill",
      },
      {
        header: "Último acesso",
        cell: (user) =>
          user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Nunca acessou",
        className: "whitespace-nowrap",
        skeleton: "w-28",
      },
      {
        header: "Criado em",
        cell: (user) => formatDate(user.createdAt),
        skeleton: "w-20",
      },
    ],
    [label],
  );

  return (
    <DataTable
      columns={columns}
      items={users}
      rowKey={(user) => user.id}
      rowHref={(user) => routeTo.user(user.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando usuários…"
      skeletonRows={3}
      empty={<EmptyState icon={UserCog} title="Nenhum usuário encontrado" />}
    />
  );
}
