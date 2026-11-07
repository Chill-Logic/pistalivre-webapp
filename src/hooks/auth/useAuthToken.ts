import { useSyncExternalStore } from "react";
import { authToken } from "@/helpers/auth-token";

/** Current bearer token; re-renders on login/logout (and on 401). */
export function useAuthToken() {
  return useSyncExternalStore(authToken.subscribe, authToken.get);
}
