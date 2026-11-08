import { isAxiosError } from "axios";
import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(params: {
    status: number;
    code: string;
    message: string;
    fields?: Record<string, string>;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.fields = params.fields;
  }
}

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as ApiErrorBody).error?.message === "string"
  );
}

/**
 * A request with `responseType: "blob"` (PDF, spreadsheet) gets its error
 * body as a Blob too: read it back as JSON so the server's message (e.g.
 * "Integração do Inter incompleta") reaches the person.
 */
export async function withJsonErrorBody(error: unknown) {
  if (!isAxiosError(error)) return error;
  const response = error.response;
  if (!response || !(response.data instanceof Blob)) return error;
  try {
    response.data = JSON.parse(await response.data.text());
  } catch {
    // Not JSON: keep the blob, the generic message applies.
  }
  return error;
}

/** Normalize anything thrown by the HTTP layer into an `ApiError` (PT-BR message). */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    if (isApiErrorBody(data)) {
      return new ApiError({ status, ...data.error });
    }
    if (!error.response) {
      return new ApiError({
        status: 0,
        code: "NETWORK",
        message: "Sem conexão com o servidor. Verifique sua internet.",
      });
    }
    return new ApiError({
      status,
      code: "HTTP",
      message: "Algo deu errado. Tente novamente.",
    });
  }

  return new ApiError({
    status: 0,
    code: "UNKNOWN",
    message: "Algo deu errado. Tente novamente.",
  });
}

/**
 * A request made with `responseType: "blob"` (a PDF) gets its error body as a
 * Blob too: turn it back into the JSON error, so `toApiError` reads the
 * server's reason instead of the generic message. Rethrows the same error.
 */
export async function rethrowBlobError(error: unknown): Promise<never> {
  if (isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      error.response.data = JSON.parse(await error.response.data.text());
    } catch {
      // Not JSON: keep the generic message.
    }
  }
  throw error;
}

/** Message to show the user for any error. */
export function errorMessage(error: unknown) {
  return toApiError(error).message;
}

export function isNotFound(error: unknown) {
  return toApiError(error).status === 404;
}
