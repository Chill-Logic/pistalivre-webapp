import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import {
  currentPushSubscription,
  pushBlocker,
  subscribeToPush,
  unsubscribeFromPush,
  type PushBlocker,
} from "@/helpers/push";
import { notificationsService } from "@/services/api/gestao/notifications.service";

/**
 * Push on THIS device: whether it is on, why it can't be, and the two
 * actions. The permission prompt only comes from `enable` (a click), never on
 * load: browsers block sites that ask by themselves.
 */
export function usePushDevice(publicKey: string | null) {
  const queryClient = useQueryClient();
  const [blocker, setBlocker] = useState<PushBlocker>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBlocker(pushBlocker());
    currentPushSubscription()
      .then((subscription) => setSubscribed(Boolean(subscription)))
      .catch(() => setSubscribed(false));
  }, []);

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.settings() });

  const enable = useCallback(async () => {
    if (!publicKey) return;
    setBusy(true);
    try {
      const subscription = await subscribeToPush(publicKey);
      await notificationsService.subscribePush(subscription);
      setSubscribed(true);
      toast.success("Push ativado neste aparelho");
    } catch (error) {
      setBlocker(pushBlocker());
      toast.error(error instanceof Error && !("response" in error) ? error.message : errorMessage(error));
    } finally {
      setBusy(false);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) await notificationsService.unsubscribePush(endpoint);
      setSubscribed(false);
      toast.success("Push desativado neste aparelho");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { blocker, subscribed, busy, enable, disable };
}
