import { http } from "@/services/http/client";
import type { PixKeyPreview, WalletKey, WalletKeyInput } from "@/types/portal";

/**
 * The customer's pix keys, managed by the team (registering a key is not
 * moving money). Preview and add query the DICT: 20/min per staff user.
 */
export const customerWalletService = {
  async list(customerId: string) {
    const { data } = await http.get<{ items: WalletKey[] }>(
      `/customers/${customerId}/wallet`,
    );
    return data.items;
  },
  async preview(
    customerId: string,
    input: Pick<WalletKeyInput, "pixKeyType" | "pixKey">,
  ) {
    const { data } = await http.post<PixKeyPreview>(
      `/customers/${customerId}/wallet/preview`,
      input,
    );
    return data;
  },
  async add(customerId: string, input: WalletKeyInput) {
    const { data } = await http.post<WalletKey>(
      `/customers/${customerId}/wallet`,
      input,
    );
    return data;
  },
  async setDefault(customerId: string, methodId: string) {
    await http.put(`/customers/${customerId}/wallet/${methodId}/default`);
  },
  async remove(customerId: string, methodId: string) {
    await http.delete(`/customers/${customerId}/wallet/${methodId}`);
  },
};
