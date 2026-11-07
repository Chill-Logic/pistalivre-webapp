import { Construction } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";

type ComingSoonPageProps = {
  title: string;
};

/** Placeholder for sections whose API is not published yet. */
export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <Box className="space-y-6">
      <PageHeader title={title} />
      <EmptyState
        icon={Construction}
        title="Em migração"
        description="Esta tela ainda está sendo migrada para o novo app."
      />
    </Box>
  );
}
