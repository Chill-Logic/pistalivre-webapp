import { http } from "@/services/http/client";
import type {
  Expense,
  ExpenseInput,
  ExpenseMonth,
  SupplierMonth,
} from "@/types/expense";

/**
 * The month's bills and what was recorded about them. Bookkeeping only: the
 * money leaves outside the system; nothing is paid from here.
 */
export const expensesService = {
  async month(month: string) {
    const { data } = await http.get<ExpenseMonth>("/expenses/month", {
      params: { month },
    });
    return data;
  },
  async supplierMonths(supplierId: string) {
    const { data } = await http.get<{ items: SupplierMonth[] }>(
      `/suppliers/${supplierId}/months`,
    );
    return data.items;
  },
  async get(id: string) {
    const { data } = await http.get<Expense>(`/expenses/${id}`);
    return data;
  },
  async create(input: ExpenseInput, key: string) {
    const { data } = await http.post<Expense>("/expenses", input, {
      headers: { "Idempotency-Key": key },
    });
    return data;
  },
  async update(id: string, input: ExpenseInput) {
    const { data } = await http.put<Expense>(`/expenses/${id}`, input);
    return data;
  },
  async remove(id: string) {
    await http.delete(`/expenses/${id}`);
  },
};
