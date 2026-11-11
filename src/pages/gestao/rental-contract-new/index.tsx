import { FileText, IdCard } from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { TextLink } from "@/components/molecules/text-link";
import { ContractEditor } from "@/components/organisms/contract-editor";
import { CustomerLicenseForm } from "@/components/organisms/customer-license-form";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound, toApiError } from "@/helpers/api-error";
import { useContractDraft } from "@/hooks/api/gestao/contracts/useRentalContracts";
import { useCustomer } from "@/hooks/api/gestao/customers/useCustomer";
import { useRental } from "@/hooks/api/gestao/rentals/useRental";
import { useContractTemplates } from "@/hooks/api/gestao/templates/useContractTemplates";
import { formatCalendarDate } from "@/utils/format";

/**
 * "Gerar contrato", as in the management app: 1) choose the template
 * (`?modelo=`), 2) the customer's CNH when it is not valid (or `?cnh=editar`),
 * saved on the customer, 3) the merged text in the editor → PDF. Only the
 * last step's "Gerar PDF e salvar" creates the contract.
 */
export function RentalContractNewPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const templateId = params.get("modelo") ?? "";
  const editingLicense = params.get("cnh") === "editar";

  const rental = useRental(id);
  const templates = useContractTemplates();
  const active = templates.data?.filter((item) => item.active);
  const template = active?.find((item) => item.id === templateId);
  const retroactive = rental.data?.source === "MANUAL";

  const draft = useContractDraft(
    id,
    templateId,
    Boolean(rental.data && template) && !retroactive && !editingLicense,
  );
  const draftError = draft.isError ? toApiError(draft.error) : null;
  const licenseProblem = draftError?.fields?.cnh;
  const askLicense = Boolean(template) && (editingLicense || licenseProblem);
  const customer = useCustomer(
    askLicense ? (rental.data?.customer.id ?? "") : "",
  );

  const rentalUrl = routeTo.rental(id);
  const setStep = (step: { templateId?: string; editLicense?: boolean }) =>
    setParams(() => {
      const next = new URLSearchParams();
      if (step.templateId) next.set("modelo", step.templateId);
      if (step.editLicense) next.set("cnh", "editar");
      return next;
    });

  const loading = rental.isPending || templates.isPending;

  return (
    <Box className="space-y-4">
      <BackLink to={rentalUrl} label={rental.data?.code ?? "Locação"} />
      <PageHeader title="Gerar contrato" />

      {loading && (
        <SkeletonRegion label="Carregando modelos…">
          <ContractTemplatesSkeleton />
        </SkeletonRegion>
      )}
      {rental.isError &&
        (isNotFound(rental.error) ? (
          <EmptyState
            icon={FileText}
            title="Locação não encontrada"
            description="Ela pode ter sido excluída ou o endereço está errado."
          />
        ) : (
          <QueryError error={rental.error} onRetry={() => rental.refetch()} />
        ))}
      {templates.isError && (
        <QueryError
          error={templates.error}
          onRetry={() => templates.refetch()}
        />
      )}

      {rental.data && active && retroactive && (
        <EmptyState
          icon={FileText}
          title="Locação retroativa"
          description="O contrato dela foi assinado fora do sistema: anexe o PDF assinado em Documentos, na ficha da locação."
          action={
            <Button asChild variant="outline">
              <Link to={rentalUrl}>Voltar à locação</Link>
            </Button>
          }
        />
      )}

      {rental.data && active && !retroactive && active.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Nenhum modelo de contrato cadastrado ainda"
          description="O contrato é gerado a partir de um modelo."
          action={
            <Button asChild>
              <Link to={ROUTES.contractTemplateNew}>
                Criar modelo de contrato
              </Link>
            </Button>
          }
        />
      )}

      {rental.data && active && !retroactive && active.length > 0 && (
        <>
          {!template ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Escolha o modelo</CardTitle>
              </CardHeader>
              <CardContent>
                <List className="space-y-2">
                  {active.map((item) => (
                    <ListItem key={item.id}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setStep({ templateId: item.id })}
                      >
                        <FileText />
                        {item.name}
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ) : (
            <>
              <Button
                variant="link"
                size="sm"
                className="px-0"
                onClick={() => setStep({})}
              >
                Modelo: {template.name} · trocar
              </Button>

              {askLicense &&
                (customer.isPending ? (
                  <SkeletonRegion label="Carregando a CNH…">
                    <LicenseStepSkeleton />
                  </SkeletonRegion>
                ) : customer.isError ? (
                  <QueryError
                    error={customer.error}
                    onRetry={() => customer.refetch()}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <IdCard className="size-4" aria-hidden />
                        CNH do locatário
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {licenseProblem && <Alert>{licenseProblem}</Alert>}
                      <Text tone="muted">
                        Informe os dados da CNH de {customer.data.name} para
                        gerar o contrato. Eles ficam salvos no cadastro do
                        cliente e valem para os próximos contratos.
                      </Text>
                      <CustomerLicenseForm
                        customerId={customer.data.id}
                        current={{
                          number: customer.data.driverLicense,
                          issuedAt: customer.data.driverLicenseIssuedAt,
                          validUntil: customer.data.driverLicenseValidUntil,
                        }}
                        submitLabel="Salvar CNH e continuar"
                        onSaved={() => setStep({ templateId })}
                        cancel={
                          editingLicense && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setStep({ templateId })}
                            >
                              Cancelar
                            </Button>
                          )
                        }
                      />
                    </CardContent>
                  </Card>
                ))}

              {!askLicense && draft.isPending && (
                <SkeletonRegion label="Montando o contrato…">
                  <ContractEditorSkeleton />
                </SkeletonRegion>
              )}
              {!askLicense &&
                draftError &&
                (draftError.status === 409 ? (
                  <Alert>{draftError.message}</Alert>
                ) : (
                  <QueryError
                    error={draft.error}
                    onRetry={() => draft.refetch()}
                  />
                ))}
              {!askLicense && draft.data && (
                <>
                  <Text tone="muted">
                    CNH do cliente: {draft.data.cnh.number}
                    {draft.data.cnh.validUntil &&
                      ` · válida até ${formatCalendarDate(draft.data.cnh.validUntil)}`}
                    {" · "}
                    <TextLink
                      to={routeTo.newRentalContract(id, {
                        templateId,
                        editLicense: true,
                      })}
                    >
                      editar
                    </TextLink>
                  </Text>
                  <ContractEditor
                    key={draft.data.id}
                    rentalId={id}
                    templateId={templateId}
                    draft={draft.data}
                    aiEnabled={draft.data.aiEnabled}
                    cancelTo={rentalUrl}
                    onSaved={() => navigate(rentalUrl, { replace: true })}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}

function ContractTemplatesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-40 text-base" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </CardContent>
    </Card>
  );
}

function LicenseStepSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-36 text-base" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton shape="text" className="w-full text-sm" />
        <Row className="gap-y-4">
          {[0, 1, 2].map((index) => (
            <Col key={index} sm={4} className="space-y-2">
              <Skeleton shape="text" className="w-24 text-sm" />
              <Skeleton className="h-10" />
            </Col>
          ))}
        </Row>
        <Box className="flex justify-end">
          <Skeleton className="h-10 w-48" />
        </Box>
      </CardContent>
    </Card>
  );
}

function ContractEditorSkeleton() {
  return (
    <Box className="space-y-4">
      <Skeleton shape="text" className="w-72 max-w-full text-sm" />
      <Card>
        <CardContent className="space-y-4 pt-4 md:pt-6">
          <Skeleton className="h-36" />
          <Skeleton shape="text" className="w-full text-sm" />
          <Skeleton className="h-10" />
          <Skeleton className="h-96" />
          <Box className="flex justify-end gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-40" />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
