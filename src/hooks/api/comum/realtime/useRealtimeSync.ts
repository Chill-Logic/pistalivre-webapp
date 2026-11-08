import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { apiOrigin } from "@/config/env";
import {
  REALTIME_FLUSH_MS,
  REALTIME_INVALIDATIONS,
} from "@/constants/realtime";
import { useAuthToken } from "@/hooks/auth/useAuthToken";

/**
 * Keeps the screens live: one Socket.io connection per session (the server
 * puts staff in `staff` and a customer in its own room) and, on each event,
 * the affected caches go stale. Events of a burst are flushed together.
 */
export function useRealtimeSync() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const socket = io(apiOrigin, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });
    const pending = new Map<string, readonly string[]>();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const flush = () => {
      timer = undefined;
      pending.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [...queryKey] }),
      );
      pending.clear();
    };

    socket.onAny((event: string) => {
      const keys = REALTIME_INVALIDATIONS[event];
      if (!keys) return;
      keys.forEach((key) => pending.set(key.join("|"), key));
      timer ??= setTimeout(flush, REALTIME_FLUSH_MS);
    });

    return () => {
      if (timer) clearTimeout(timer);
      socket.disconnect();
    };
  }, [token, queryClient]);
}
