import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { RemoteOption } from "@/components/molecules/remote-combobox";
import { queryKeys } from "@/constants/query-keys";
import { useCustomers } from "@/hooks/api/gestao/customers/useCustomers";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import { usersService } from "@/services/api/gestao/users.service";

const PICKER_SIZE = 10;

/** Someone already registered who can sign without retyping their data. */
export type SignerCandidate = {
  kind: "customer" | "user";
  id: string;
  name: string;
  email: string;
  phone: string | null;
  documentation: string | null;
};

/**
 * Customers and staff in one search (server-side). Retyping a CPF is where
 * qualification errors are born, so picking fills the signer in.
 */
export function useSignerCandidates() {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const customers = useCustomers({
    page: 1,
    pageSize: PICKER_SIZE,
    q,
    status: "",
    test: "",
  });
  const userFilters = { page: 1, pageSize: PICKER_SIZE, q, role: "" } as const;
  const users = useQuery({
    queryKey: queryKeys.users.list(userFilters),
    queryFn: () => usersService.list(userFilters),
  });

  const candidates = useMemo<SignerCandidate[]>(
    () => [
      ...(customers.data?.items ?? []).map((customer) => ({
        kind: "customer" as const,
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        documentation: customer.document,
      })),
      ...(users.data?.items ?? []).map((user) => ({
        kind: "user" as const,
        id: user.id,
        name: user.name,
        email: user.email,
        phone: null,
        documentation: null,
      })),
    ],
    [customers.data, users.data],
  );

  const options = useMemo<RemoteOption[]>(
    () =>
      candidates.map((candidate) => ({
        value: `${candidate.kind}:${candidate.id}`,
        label: candidate.name,
        detail: `${candidate.kind === "customer" ? "Cliente" : "Equipe"} · ${candidate.email}`,
      })),
    [candidates],
  );

  const find = (value: string) =>
    candidates.find(
      (candidate) => `${candidate.kind}:${candidate.id}` === value,
    );

  return {
    search,
    setSearch,
    options,
    find,
    isLoading: customers.isFetching || users.isFetching,
  };
}
