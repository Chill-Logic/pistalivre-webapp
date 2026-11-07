import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toApiError } from "@/helpers/api-error";

type ApplyOptions<T extends FieldValues> = {
  /**
   * A 409 comes with a message only ("Já existe um veículo com esse(a)
   * chassi"): the keyword in it says which field it belongs to.
   */
  conflictFields?: Record<string, Path<T>>;
};

/**
 * Put the API's validation messages (422 `fields`, already in PT) on the
 * matching inputs. Returns the message for a form-level alert when no field
 * could take it.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  known: readonly Path<T>[],
  { conflictFields = {} }: ApplyOptions<T> = {},
): string | null {
  const apiError = toApiError(error);
  let placed = false;

  for (const [field, message] of Object.entries(apiError.fields ?? {})) {
    if ((known as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: "server", message });
      placed = true;
    }
  }

  if (!placed && apiError.status === 409) {
    const text = apiError.message.toLowerCase();
    const match = Object.entries(conflictFields).find(([keyword]) =>
      text.includes(keyword),
    );
    if (match) {
      setError(match[1], { type: "server", message: apiError.message });
      placed = true;
    }
  }

  return placed ? null : apiError.message;
}
