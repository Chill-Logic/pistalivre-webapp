import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Image } from "@/components/atoms/image";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { FilePicker } from "@/components/molecules/file-picker";
import { FormField } from "@/components/molecules/form-field";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { CreatableCombobox } from "@/components/molecules/creatable-combobox";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { useCatalogWrites } from "@/hooks/api/gestao/catalog/useCatalogWrites";
import { useVehicleFormOptions } from "@/hooks/api/gestao/vehicles/useVehicleFormOptions";
import { useObjectUrl } from "@/hooks/ui/useObjectUrl";
import type { CatalogItem } from "@/types/catalog";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";
const IMAGE_MODES = [
  { value: "upload", label: "Enviar imagem" },
  { value: "link", label: "Usar um link" },
];

type Errors = Partial<
  Record<"brand" | "model" | "year" | "imageUrl" | "file" | "form", string>
>;

type CatalogItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Editing this item; absent = a new one. */
  item?: CatalogItem | null;
  /** New item already pointing at a model + year of the fleet. */
  preset?: { modelId: string; year: number } | null;
};

/**
 * A model + year of the catalogue: its picture (uploaded, PNG preferred, or a
 * link) and a short text. Colours and units come from the fleet.
 */
export function CatalogItemDialog({ open, onOpenChange, item, preset }: CatalogItemDialogProps) {
  const options = useVehicleFormOptions();
  const { save, uploadImage, removeImage } = useCatalogWrites();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [seeded, setSeeded] = useState<string | null>(null);
  const preview = useObjectUrl(files[0] ?? null);

  // Fill the form once per opening (and once the models arrived).
  const seedKey = open && options.data ? `${item?.id ?? "new"}:${preset?.modelId ?? ""}:${preset?.year ?? ""}` : null;
  if (seedKey && seedKey !== seeded) {
    const startModel = options.data?.models.find(
      (m) => m.id === (item?.modelId ?? preset?.modelId),
    );
    setSeeded(seedKey);
    setModel(startModel?.name ?? "");
    setBrand(options.data?.brands.find((b) => b.id === startModel?.brandId)?.name ?? "");
    setYear(String(item?.year ?? preset?.year ?? ""));
    setDescription(item?.description ?? "");
    setMode(item?.imageSource === "link" ? "link" : "upload");
    setImageUrl(item?.imageUrl ?? "");
    setFiles([]);
    setActive(item?.active ?? true);
    setErrors({});
  }
  if (!open && seeded) setSeeded(null);

  // Brand and model by name: a new one is created with the item.
  const brandId = options.data?.brands.find(
    (b) => b.name.toLowerCase() === brand.trim().toLowerCase(),
  )?.id;
  const models = (options.data?.models ?? []).filter((m) => m.brandId === brandId);
  const pending = save.isPending || uploadImage.isPending || removeImage.isPending;
  const shownImage =
    mode === "upload"
      ? (preview ?? (item?.imageSource === "upload" ? item.imageSrc : null))
      : imageUrl.startsWith("https://")
        ? imageUrl
        : null;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!brand.trim()) next.brand = "Informe a marca";
    if (!model.trim()) next.model = "Informe o modelo";
    if (!/^\d{4}$/.test(year)) next.year = "Informe o ano";
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      const saved = await save.mutateAsync({
        id: item?.id,
        input: {
          modelId: null,
          brand: brand.trim(),
          model: model.trim(),
          year: Number(year),
          description: description.trim() || null,
          // A link only counts when "Usar um link" is chosen.
          imageUrl: mode === "link" ? imageUrl.trim() || null : (item?.imageUrl ?? null),
          active,
          sortOrder: item?.sortOrder ?? 0,
        },
      });
      if (mode === "upload" && files[0]) {
        await uploadImage.mutateAsync({ id: saved.id, file: files[0] });
      }
      // The upload wins over a link: switching to a link drops the upload.
      if (mode === "link" && item?.imageSource === "upload") {
        await removeImage.mutateAsync(saved.id);
      }
      toast.success(item ? "Catálogo atualizado" : "Adicionado ao catálogo");
      onOpenChange(false);
    } catch (error) {
      const apiError = toApiError(error);
      const fields = apiError.fields ?? {};
      setErrors({
        brand: fields.brand,
        model: fields.model ?? fields.modelId,
        year: fields.year,
        imageUrl: fields.imageUrl,
        file: fields.file,
        form: Object.keys(fields).length ? undefined : apiError.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{item ? "Editar item do catálogo" : "Novo item do catálogo"}</DialogTitle>
        <DialogDescription>
          Um modelo e ano, como o cliente vê. As cores e as unidades vêm da frota.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            <Col sm={6}>
              <CreatableCombobox
                label="Marca"
                value={brand}
                options={(options.data?.brands ?? []).map((b) => ({ value: b.name, label: b.name }))}
                onChange={(next) => {
                  if (next !== brand) setModel("");
                  setBrand(next);
                }}
                placeholder="Escolha ou digite"
                searchPlaceholder="Buscar ou criar…"
                createLabel="Usar"
                error={errors.brand}
                disabled={pending}
              />
            </Col>
            <Col sm={6}>
              <CreatableCombobox
                label="Modelo"
                value={model}
                options={models.map((m) => ({ value: m.name, label: m.name }))}
                onChange={setModel}
                placeholder={brand ? "Escolha ou digite" : "Escolha a marca antes"}
                searchPlaceholder="Buscar ou criar…"
                createLabel="Usar"
                error={errors.model}
                disabled={pending || !brand}
              />
            </Col>
            <Col sm={6}>
              <FormField
                label="Ano"
                inputMode="numeric"
                maxLength={4}
                placeholder="2026"
                value={year}
                onChange={(event) => setYear(event.target.value.replace(/\D/g, ""))}
                error={errors.year}
                disabled={pending}
              />
            </Col>
          </Row>
          <TextareaField
            label="Descrição (opcional)"
            rows={3}
            maxLength={600}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={pending}
          />
          <SegmentedField
            label="Imagem"
            value={mode}
            options={IMAGE_MODES}
            onChange={setMode}
            disabled={pending}
          />
          {mode === "upload" ? (
            <Box className="space-y-1">
              <FilePicker
                label={item?.imageSource === "upload" ? "Trocar a imagem" : "Escolher a imagem"}
                accept={IMAGE_ACCEPT}
                files={files}
                onChange={setFiles}
                multiple={false}
                disabled={pending}
              />
              <Text size="xs" tone="muted">
                PNG com fundo transparente fica melhor. Até 8 MB.
              </Text>
              {errors.file && <Text size="xs" tone="destructive">{errors.file}</Text>}
            </Box>
          ) : (
            <FormField
              label="Link da imagem (https)"
              inputMode="url"
              placeholder="https://…/modelo.png"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              error={errors.imageUrl}
              disabled={pending}
            />
          )}
          {shownImage && (
            <Box className="flex justify-center rounded-md border bg-muted/40 p-3">
              <Image src={shownImage} alt="Prévia da imagem" className="max-h-40 object-contain" />
            </Box>
          )}
          <CheckboxField
            label="Ativo"
            hint="Inativo fica fora do catálogo que o cliente vê."
            checked={active}
            onChange={setActive}
            disabled={pending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner className="text-primary-foreground" />}
              {item ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
