import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  VehicleWrite,
  Vehicle,
  VehicleDetail,
  VehicleFilters,
  VehicleStatus,
  VehicleDocumentResult,
  VehicleFormOptions,
  VehicleInput,
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
    const { data } = await http.patch<VehicleWrite>(`/vehicles/${id}/status`, {
      status,
    });
    return data;
  },
  async remove(id: string) {
    await http.delete(`/vehicles/${id}`);
  },
  async formOptions() {
    const { data } = await http.get<VehicleFormOptions>(
      "/vehicles/form-options",
    );
    return data;
  },
  async create(input: VehicleInput) {
    const { data } = await http.post<VehicleWrite>("/vehicles", input);
    return data;
  },
  async update(id: string, input: VehicleInput) {
    const { data } = await http.put<VehicleWrite>(`/vehicles/${id}`, input);
    return data;
  },
  /** The CRLV (photo or PDF) read by the AI: prefills the form, saves nothing. */
  async readDocument(file: File) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await http.post<VehicleDocumentResult>(
      "/vehicles/read-document",
      form,
    );
    return data;
  },
  async listTypes() {
    const { data } = await http.get<VehicleType[]>("/vehicle-types");
    return data;
  },
};
