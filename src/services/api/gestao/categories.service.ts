import { http } from "@/services/http/client";
import type { VehicleCategory, VehicleCategoryInput } from "@/types/category";

export const categoriesService = {
  async list() {
    const { data } = await http.get<VehicleCategory[]>("/categories");
    return data;
  },
  async create(input: VehicleCategoryInput) {
    const { data } = await http.post<VehicleCategory>("/categories", input);
    return data;
  },
  async rename(id: string, name: string) {
    const { data } = await http.patch<VehicleCategory>(`/categories/${id}`, {
      name,
    });
    return data;
  },
  async remove(id: string) {
    await http.delete(`/categories/${id}`);
  },
};
