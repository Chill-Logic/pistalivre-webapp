import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/molecules/empty-state";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

type AdminOnlyProps = {
  /** Why it is restricted (shown to agents). */
  description: string;
  /** Mounted only for admins, so its queries never ask for a 403. */
  children: ReactNode;
};

/** Content only administrators see; agents get "Só administradores". */
export function AdminOnly({ description, children }: AdminOnlyProps) {
  const { isAdmin } = useUserPermissions();
  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Só administradores"
        description={description}
      />
    );
  }
  return <>{children}</>;
}
