import { useMemo } from "react";
import { pickOption } from "@/helpers/select";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { UserFilters } from "@/types/user";

const KEYS = ["busca", "perfil"] as const;
const ROLES = ["ADMIN", "AGENT"] as const;

export function useUserFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);
  const filters = useMemo<UserFilters>(
    () => ({
      page,
      pageSize,
      q: values.busca,
      role: pickOption(ROLES, values.perfil),
    }),
    [page, pageSize, values],
  );
  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setRole: (value: string) => setFilter("perfil", value),
    setPage,
    setPageSize,
  };
}
