import axios from "axios";
import { env } from "@/config/env";
import { authToken } from "@/helpers/auth-token";
import { toApiError, withJsonErrorBody } from "@/helpers/api-error";

/** Single axios instance for the API: bearer auth + normalized errors. */
export const http = axios.create({
  baseURL: `${env.VITE_API_URL}/v1`,
  timeout: 20_000,
  headers: { Accept: "application/json" },
});

http.interceptors.request.use((config) => {
  const token = authToken.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = toApiError(await withJsonErrorBody(error));
    // Expired/invalid session: drop the token; the route guard sends to login.
    if (apiError.status === 401) authToken.clear();
    return Promise.reject(apiError);
  },
);
