import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  Vehicle,
  VehicleDetail,
  VehicleFilters,
  VehicleStatus,
  VehicleType,
} from "@/types/vehicle";

export const vehiclesService = {
  async list(filters: VehicleFilters) {
    const { data } = await http.get<Paginated<Vehicle>>("/vehicles", {
      params: toQueryParams(filters),
    });
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<VehicleDetail>(`/vehicles/${id}`);
    return data;
  },
  async changeStatus(id: string, status: VehicleStatus) {
    const { data } = await http.patch<VehicleDetail>(`/vehicles/${id}/status`, {
      status,
    });
    return data;
  },
  async remove(id: string) {
    await http.delete(`/vehicles/${id}`);
  },
  async listTypes() {
    const { data } = await http.get<VehicleType[]>("/vehicle-types");
    return data;
  },
};
