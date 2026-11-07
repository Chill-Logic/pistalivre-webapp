import { Construction } from "lucide-react";
import { PageHeader } from "@/components/molecules/page-header";

type ComingSoonPageProps = {
  title: string;
};

/** Placeholder for sections whose API is not published yet. */
export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <Construction className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Esta tela ainda está sendo migrada para o novo app.
        </p>
      </div>
    </div>
  );
}
