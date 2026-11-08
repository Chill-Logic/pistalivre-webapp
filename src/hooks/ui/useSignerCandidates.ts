import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import type { RemoteOption } from "@/components/molecules/remote-combobox";
import { queryKeys } from "@/constants/query-keys";
import { useCustomers } from "@/hooks/api/gestao/customers/useCustomers";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import { customersService } from "@/services/api/gestao/customers.service";
import { usersService } from "@/services/api/gestao/users.service";

const PICKER_SIZE = 10;

/** Someone already registered who can sign without retyping their data. */
export type SignerCandidate = {
  /** "contact" = a customer's emergency contact: another person, no link. */
  kind: "customer" | "user" | "contact";
  id: string;
  name: string;
  email: string;
  phone: string | null;
  documentation: string | null;
  /** For a contact: whose emergency contact it is. */
  of?: string;
};

const keyOf = (candidate: SignerCandidate) =>
  `${candidate.kind}:${candidate.id}`;

const KIND_LABEL: Record<SignerCandidate["kind"], string> = {
  customer: "Cliente",
  user: "Equipe",
  contact: "Contato de emergência",
};

/**
 * Customers and staff in one search (server-side). Retyping a CPF is where
 * qualification errors are born, so picking fills the signer in: a staff
 * member's CPF comes from their record (GET /users/:id), and picking a
 * customer offers their emergency contact (witness, guarantor) as another
 * candidate (GET /customers/:id).
 */
export function useSignerCandidates() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<SignerCandidate[]>([]);
  const [resolving, setResolving] = useState(false);
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

  const candidates = useMemo<SignerCandidate[]>(() => {
    const term = q.trim().toLowerCase();
    return [
      ...contacts.filter(
        (contact) =>
          !term ||
          contact.name.toLowerCase().includes(term) ||
          (contact.of ?? "").toLowerCase().includes(term),
      ),
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
    ];
  }, [contacts, customers.data, users.data, q]);

  const options = useMemo<RemoteOption[]>(
    () =>
      candidates.map((candidate) => ({
        value: keyOf(candidate),
        label: candidate.name,
        detail:
          candidate.kind === "contact"
            ? `${KIND_LABEL.contact} de ${candidate.of} · ${candidate.email}`
            : `${KIND_LABEL[candidate.kind]} · ${candidate.email}`,
      })),
    [candidates],
  );

  /** Remembers a customer's emergency contact as a candidate (once). */
  const offerContact = useCallback(
    async (customerId: string) => {
      const customer = await queryClient.fetchQuery({
        queryKey: queryKeys.customers.detail(customerId),
        queryFn: () => customersService.get(customerId),
      });
      const contact = customer.emergencyContact;
      if (!contact?.name?.trim() || !contact.email?.trim()) return;
      const candidate: SignerCandidate = {
        kind: "contact",
        id: customer.id,
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone,
        documentation: null,
        of: customer.name,
      };
      setContacts((current) =>
        current.some((item) => item.id === candidate.id)
          ? current
          : [candidate, ...current],
      );
    },
    [queryClient],
  );

  /**
   * The candidate behind an option, completed from its record: the staff
   * member's CPF; for a customer, their emergency contact joins the list.
   * A record that fails to load still returns what the search had.
   */
  const pick = async (value: string) => {
    const candidate = candidates.find((item) => keyOf(item) === value);
    if (!candidate) return undefined;
    setResolving(true);
    try {
      if (candidate.kind === "user") {
        const user = await queryClient
          .fetchQuery({
            queryKey: queryKeys.users.detail(candidate.id),
            queryFn: () => usersService.get(candidate.id),
          })
          .catch(() => null);
        return { ...candidate, documentation: user?.cpf ?? null };
      }
      if (candidate.kind === "customer") {
        await offerContact(candidate.id).catch(() => undefined);
      }
      return candidate;
    } finally {
      setResolving(false);
    }
  };

  return {
    search,
    setSearch,
    options,
    pick,
    /** Emergency contacts offered so far (customers already picked). */
    contacts,
    offerContact,
    isResolving: resolving,
    isLoading: customers.isFetching || users.isFetching,
  };
}
