import { useAuthToken } from "@/hooks/auth/useAuthToken";
import { useMe } from "@/hooks/api/auth/useMe";
import type { AuthUser } from "@/types/auth";

export type Session =
  | { status: "loading"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: AuthUser };

/** Single answer to "who is using the app?", for guards and the shell. */
export function useSession(): Session {
  const token = useAuthToken();
  const me = useMe();

  if (!token) return { status: "anonymous", user: null };
  if (me.data) return { status: "authenticated", user: me.data };
  if (me.isError) return { status: "anonymous", user: null };
  return { status: "loading", user: null };
}
