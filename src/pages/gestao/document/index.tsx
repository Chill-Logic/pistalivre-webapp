import { FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { BackLink } from "@/components/molecules/back-link";
import { DocumentItem } from "@/components/molecules/document-item";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { TextLink } from "@/components/molecules/text-link";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useDocument } from "@/hooks/api/gestao/documents/useDocument";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { DocumentOwnerType } from "@/types/document";

/** Where the file lives in the app (null = no page for that owner). */
function ownerPage(type: DocumentOwnerType, id: string) {
  switch (type) {
    case "COMPANY":
      return { to: ROUTES.company, label: "Ver na tela da empresa" };
    case "RENTAL":
      return { to: routeTo.rental(id), label: "Ver na locação" };
    case "CUSTOMER":
      return { to: routeTo.customer(id), label: "Ver no cliente" };
    case "VEHICLE":
      return { to: routeTo.vehicle(id), label: "Ver no veículo" };
    default:
      return null;
  }
}

/** One file by link (the AI sends these): view, download and where it lives. */
export function DocumentPage() {
  const { id = "" } = useParams();
  const doc = useDocument(id);
  const { view, download } = useFileActions();
  const owner = doc.data
    ? ownerPage(doc.data.ownerType, doc.data.ownerId)
    : null;

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.documents} label="Documentos" />
      <PageHeader title={doc.data?.fileName ?? "Documento"} />
      {doc.isPending && (
        <SkeletonRegion label="Carregando o documento…">
          <Card>
            <CardContent className="space-y-2 pt-4 md:pt-6">
              <Skeleton shape="text" className="w-64 text-sm" />
              <Skeleton shape="text" className="w-40 text-xs" />
            </CardContent>
          </Card>
        </SkeletonRegion>
      )}
      {doc.isError &&
        (isNotFound(doc.error) ? (
          <EmptyState
            icon={FileText}
            title="Documento não encontrado"
            description="Ele pode ter sido excluído."
          />
        ) : (
          <QueryError error={doc.error} onRetry={() => doc.refetch()} />
        ))}
      {doc.data && (
        <Card>
          <CardContent className="space-y-2 pt-2 md:pt-3">
            <DocumentItem
              document={doc.data}
              onView={() => view.mutate(doc.data)}
              onDownload={() => download.mutate(doc.data)}
              isViewing={view.isPending}
              isDownloading={download.isPending}
            />
            {owner && <TextLink to={owner.to}>{owner.label}</TextLink>}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
