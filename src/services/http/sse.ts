import { env } from "@/config/env";
import { ApiError } from "@/helpers/api-error";
import { authToken } from "@/helpers/auth-token";
import { isStandalone } from "@/helpers/pwa";

type ErrorBody = {
  error?: { code?: string; message?: string; fields?: Record<string, string> };
};

const LINE_END = "\n";
const EVENT_END = "\n\n";

const toError = (status: number, body: unknown) => {
  const error = (body as ErrorBody | null)?.error;
  if (status === 401) authToken.clear();
  return new ApiError({
    status,
    code: error?.code ?? "HTTP",
    message: error?.message ?? "Algo deu errado. Tente novamente.",
    fields: error?.fields,
  });
};

/**
 * POST that answers Server-Sent Events (`data: {...}` blocks): each event
 * goes to `onEvent` as it arrives. Same Bearer and errors as the axios client
 * (axios can't read a response while it streams in the browser).
 */
export async function postEventStream(
  path: string,
  body: unknown,
  onEvent: (event: unknown) => void,
) {
  let response: Response;
  try {
    const token = authToken.get();
    response = await fetch(`${env.VITE_API_URL}/v1${path}`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        "X-Client-Mode": isStandalone() ? "pwa" : "browser",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError({
      status: 0,
      code: "NETWORK",
      message: "Sem conexão com o servidor. Verifique sua internet.",
    });
  }
  if (!response.ok || !response.body) {
    throw toError(response.status, await response.json().catch(() => null));
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let end = buffer.indexOf(EVENT_END);
    while (end !== -1) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + EVENT_END.length);
      const data = block
        .split(LINE_END)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .join("");
      if (data) onEvent(JSON.parse(data));
      end = buffer.indexOf(EVENT_END);
    }
  }
}

export { toError as eventStreamError };
