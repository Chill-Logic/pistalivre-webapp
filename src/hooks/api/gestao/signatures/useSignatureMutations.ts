import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { signaturesService } from "@/services/api/gestao/signatures.service";
import type {
  SignatureDetail,
  SignatureSettingsInput,
  SignerInput,
} from "@/types/signature";

/** The detail comes back: it replaces the cache; lists refetch. */
function useStoreSignature() {
  const queryClient = useQueryClient();
  return (signature?: SignatureDetail) => {
    if (signature) {
      queryClient.setQueryData(
        queryKeys.signatures.detail(signature.id),
        signature,
      );
    }
    queryClient.invalidateQueries({
      queryKey: queryKeys.signatures.all,
      predicate: (query) => query.queryKey[1] !== "detail",
    });
    // A document under signature cannot be deleted: its folders change too.
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
  };
}

export function useCreateSignature() {
  const store = useStoreSignature();
  return useMutation({
    mutationFn: ({ documentId, name }: { documentId: string; name: string }) =>
      signaturesService.create(documentId, name),
    onSuccess: (signature) => {
      store(signature);
      toast.success("Rascunho criado: configure e solicite as assinaturas");
    },
  });
}

/** Errors stay with the form (422 fields). */
export function useUpdateSignatureSettings(id: string) {
  const store = useStoreSignature();
  return useMutation({
    mutationFn: (input: SignatureSettingsInput) =>
      signaturesService.updateSettings(id, input),
    onSuccess: (signature) => {
      store(signature);
      toast.success("Configuração salva");
    },
  });
}

/** Errors stay with the editor (422 per line: signers.<i>.<field>). */
export function useSetSigners(id: string) {
  const store = useStoreSignature();
  return useMutation({
    mutationFn: (signers: SignerInput[]) =>
      signaturesService.setSigners(id, signers),
    onSuccess: (signature) => {
      store(signature);
      toast.success("Signatários salvos");
    },
  });
}

export function useSendSignature(id: string) {
  const store = useStoreSignature();
  return useMutation({
    mutationFn: (key: string) => signaturesService.send(id, key),
    onSuccess: (signature) => {
      store(signature);
      toast.success("Assinaturas solicitadas: os signatários foram avisados");
    },
  });
}

type SimpleAction = "cancel" | "confirmSigned" | "unlink" | "remove";

const DONE: Record<SimpleAction, string> = {
  cancel: "Assinatura cancelada",
  confirmSigned: "Assinatura confirmada",
  unlink: "Vínculo desfeito",
  remove: "Pedido excluído",
};

/** Cancel / confirm signed / unlink / delete: errors stay with the dialog. */
export function useSignatureAction(id: string, action: SimpleAction) {
  const queryClient = useQueryClient();
  const store = useStoreSignature();
  return useMutation({
    mutationFn: async () => {
      if (action === "cancel") return signaturesService.cancel(id);
      if (action === "confirmSigned")
        return signaturesService.confirmSigned(id);
      if (action === "unlink") await signaturesService.unlink(id);
      else await signaturesService.remove(id);
      return undefined;
    },
    onSuccess: (signature) => {
      if (!signature) {
        queryClient.removeQueries({
          queryKey: queryKeys.signatures.detail(id),
        });
      }
      store(signature);
      // Confirming signs the rental/customer/lead behind it.
      if (action === "confirmSigned") {
        queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
      }
      toast.success(DONE[action]);
    },
  });
}

export function useNotifySigner(id: string) {
  return useMutation({
    mutationFn: (signerId: string) =>
      signaturesService.notifySigner(id, signerId),
    onSuccess: () => toast.success("Convite reenviado"),
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useProviderEnvelopes(status: string, page: number) {
  return useQuery({
    queryKey: [...queryKeys.signatures.all, "envelopes", status, page],
    queryFn: () =>
      signaturesService.envelopes({
        status: status || undefined,
        page,
        pageSize: 20,
      }),
  });
}

export function useEnvelopeDocuments(externalId: string) {
  return useQuery({
    queryKey: [...queryKeys.signatures.all, "envelope-documents", externalId],
    queryFn: () => signaturesService.envelopeDocuments(externalId),
  });
}

export function useImportEnvelope() {
  const store = useStoreSignature();
  return useMutation({
    mutationFn: ({
      externalId,
      documents,
    }: {
      externalId: string;
      documents: { externalDocumentId: string; documentId: string }[];
    }) => signaturesService.importEnvelope(externalId, documents),
    onSuccess: (created) => {
      store();
      toast.success(
        created.length === 1
          ? "Envelope vinculado"
          : `${created.length} documentos vinculados`,
      );
    },
  });
}
