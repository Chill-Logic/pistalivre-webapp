import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { HtmlPreview } from "@/components/atoms/html-preview";
import { Skeleton } from "@/components/atoms/skeleton";
import { previewHtml } from "@/helpers/html";

/** The proposal exactly as it was issued (frozen snapshot, sanitized). */
export function ProposalPreview({ html }: { html: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Texto da proposta</CardTitle>
      </CardHeader>
      <CardContent>
        <HtmlPreview html={previewHtml(html)} />
      </CardContent>
    </Card>
  );
}

export function ProposalPreviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-40 text-base" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton
            key={index}
            shape="text"
            className={index % 3 === 2 ? "w-2/3 text-sm" : "w-full text-sm"}
          />
        ))}
      </CardContent>
    </Card>
  );
}
