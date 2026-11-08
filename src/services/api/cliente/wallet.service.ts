import { http } from "@/services/http/client";
import type { PixKeyPreview, WalletKeyInput } from "@/types/portal";

/**
 * The renter's pix keys (where refunds go). Every key is checked in the
 * DICT before it is saved; both calls share a 15/min budget.
 */
export const walletService = {
  async preview(input: Pick<WalletKeyInput, "pixKeyType" | "pixKey">) {
    const { data } = await http.post<PixKeyPreview>(
      "/me/wallet/preview",
      input,
    );
    return data;
  },
  async add(input: WalletKeyInput) {
    const { data } = await http.post<{ id: string }>("/me/wallet", input);
    return data;
  },
  async setDefault(id: string) {
    await http.put(`/me/wallet/${id}/default`);
  },
  async remove(id: string) {
    await http.delete(`/me/wallet/${id}`);
  },
};
