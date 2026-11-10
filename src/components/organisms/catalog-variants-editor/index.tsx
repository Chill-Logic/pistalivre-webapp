import { ImageOff, Star } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Heading } from "@/components/atoms/heading";
import { Image } from "@/components/atoms/image";
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { FilePicker } from "@/components/molecules/file-picker";
import { FormField } from "@/components/molecules/form-field";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { SwatchPicker } from "@/components/molecules/swatch-picker";
import { VehicleShowcase } from "@/components/molecules/vehicle-showcase";
import { toApiError } from "@/helpers/api-error";
import { useCatalogVariants } from "@/hooks/api/gestao/catalog/useCatalogVariants";
import { useObjectUrl } from "@/hooks/ui/useObjectUrl";
import type { CatalogItem } from "@/types/catalog";
import { pluralize } from "@/utils/text";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";
const IMAGE_MODES = [
  { value: "upload", label: "Enviar imagem" },
  { value: "link", label: "Usar um link" },
];

type Errors = Partial<Record<"color" | "imageUrl" | "file" | "form", string>>;

/**
 * The colours of a catalogue item: the same model + year in each paint, each
 * with its own picture and swatch. One is the default (the cover).
 */
export function CatalogVariantsEditor({ item }: { item: CatalogItem }) {
  const { add, setDefault, remove } = useCatalogVariants(item.id);
  const [color, setColor] = useState("");
  const [swatch, setSwatch] = useState("");
  const [mode, setMode] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const filePreview = useObjectUrl(files[0] ?? null);
  // What this colour will look like, before adding (catches a wrong file).
  const preview =
    mode === "upload" ? filePreview : imageUrl.trim().startsWith("https://") ? imageUrl.trim() : null;

  const onAdd = () => {
    const next: Errors = {};
    if (!color) next.color = "Escolha a cor";
    setErrors(next);
    if (Object.keys(next).length) return;
    add.mutate(
      {
        input: {
          color,
          swatch: swatch || null,
          imageUrl: mode === "link" ? imageUrl.trim() || null : null,
        },
        file: mode === "upload" ? (files[0] ?? null) : null,
      },
      {
        onSuccess: () => {
          setColor("");
          setSwatch("");
          setImageUrl("");
          setFiles([]);
        },
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            color: fields.color ?? fields.swatch,
            imageUrl: fields.imageUrl,
            file: fields.file,
            form: Object.keys(fields).length ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Box className="space-y-4 border-t pt-4">
      <Box>
        <Heading level={3} variant="section">
          Cores
        </Heading>
        <Text size="xs" tone="muted">
          O mesmo modelo e ano em cada cor, com a foto dela. A padrão é a capa.
        </Text>
      </Box>

      {item.variants.length > 0 && (
        <List className="divide-y rounded-md border">
          {item.variants.map((variant) => (
            <ListItem key={variant.id} className="flex items-center gap-3 p-2">
              <Box className="flex size-14 shrink-0 items-center justify-center rounded bg-muted/40">
                {variant.imageSrc ? (
                  <Image src={variant.imageSrc} alt={variant.color} className="max-h-full max-w-full object-contain" />
                ) : (
                  <ImageOff className="size-5 text-muted-foreground" aria-label="Sem imagem" />
                )}
              </Box>
              <Box className="min-w-0 flex-1">
                <Box className="flex items-center gap-2">
                  <Box
                    aria-hidden="true"
                    className="size-3.5 shrink-0 rounded-full border"
                    style={{ backgroundColor: variant.swatch ?? "transparent" }}
                  />
                  <Text weight="medium" truncate>
                    {variant.color}
                  </Text>
                  {variant.isDefault && <Badge variant="success">Padrão</Badge>}
                </Box>
                <Text size="xs" tone="muted">
                  {variant.units
                    ? `${pluralize(variant.units, "unidade", "unidades")} na frota`
                    : "Nenhuma unidade na frota"}
                </Text>
              </Box>
              <Box className="flex shrink-0 gap-1">
                {!variant.isDefault && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    title="Usar como padrão"
                    aria-label={`Usar ${variant.color} como padrão`}
                    disabled={setDefault.isPending}
                    onClick={() => setDefault.mutate(variant.id)}
                  >
                    <Star />
                  </Button>
                )}
                <ConfirmDialog
                  trigger={
                    <Button type="button" size="sm" variant="ghost">
                      Remover
                    </Button>
                  }
                  title={`Remover a cor ${variant.color}?`}
                  description="Sai só a cor do catálogo e a foto enviada dela. Os veículos da frota não mudam."
                  confirmLabel="Remover"
                  destructive
                  isPending={remove.isPending}
                  onConfirm={() => remove.mutate(variant.id)}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      <Box className="space-y-3 rounded-md border border-dashed p-3">
        <SwatchPicker
          label="Nova cor"
          value={color}
          onChange={(paint) => {
            setColor(paint.name);
            setSwatch(paint.hex);
          }}
          taken={item.variants.map((variant) => variant.color)}
          error={errors.color}
          disabled={add.isPending}
        />
        <SegmentedField
          label="Foto desta cor"
          value={mode}
          options={IMAGE_MODES}
          onChange={setMode}
          disabled={add.isPending}
        />
        {mode === "upload" ? (
          <Box className="space-y-1">
            <FilePicker
              label="Escolher a imagem"
              accept={IMAGE_ACCEPT}
              files={files}
              onChange={setFiles}
              multiple={false}
              disabled={add.isPending}
            />
            {errors.file && (
              <Text size="xs" tone="destructive">
                {errors.file}
              </Text>
            )}
          </Box>
        ) : (
          <FormField
            label="Link da imagem (https)"
            inputMode="url"
            placeholder="https://…/vermelha.png"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            error={errors.imageUrl}
            disabled={add.isPending}
          />
        )}
        {preview && (
          <VehicleShowcase
            src={preview}
            alt={`Prévia${color ? ` da cor ${color}` : ""}`}
            caption={color ? `Prévia · ${color}` : "Prévia · escolha a cor"}
            className="rounded-md border"
          />
        )}
        {errors.form && <Alert>{errors.form}</Alert>}
        <Button type="button" variant="outline" className="w-full" disabled={add.isPending} onClick={onAdd}>
          {add.isPending && <Spinner />}
          Adicionar cor
        </Button>
      </Box>
    </Box>
  );
}
