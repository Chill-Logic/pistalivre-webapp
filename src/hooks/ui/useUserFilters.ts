import { useMemo } from "react";
import { pickOption } from "@/helpers/select";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { UserFilters } from "@/types/user";

const KEYS = ["busca", "perfil"] as const;
const ROLES = ["ADMIN", "AGENT"] as const;

export function useUserFilters() {
  const { values, setFilter } = useUrlFilters(KEYS);
  const filters = useMemo<UserFilters>(
    () => ({ q: values.busca, role: pickOption(ROLES, values.perfil) }),
    [values],
  );
  return {
    filters,
    setSearch: (value: string) => setFilter("busca", value),
    setRole: (value: string) => setFilter("perfil", value),
  };
}
