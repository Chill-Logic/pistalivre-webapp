import type { SelectOption } from "@/helpers/select";
import type { VehicleFormOptions } from "@/types/vehicle";
import { sameText } from "@/helpers/combobox";

/** Categories of the chosen type (the form filters category by type). */
export function categoryOptions(
  options: VehicleFormOptions,
  typeSlug: string,
): SelectOption[] {
  const type = options.types.find((item) => item.slug === typeSlug);
  return options.categories
    .filter((category) => !type || category.typeId === type.id)
    .map((category) => ({ value: category.id, label: category.name }));
}

/** Type of a category (to pre-select the type when editing). */
export function typeSlugOfCategory(
  options: VehicleFormOptions,
  categoryId: string,
) {
  const category = options.categories.find((item) => item.id === categoryId);
  return options.types.find((type) => type.id === category?.typeId)?.slug ?? "";
}

/** Models of the typed/chosen brand (by name; a new brand has none yet). */
export function modelOptions(
  options: VehicleFormOptions,
  brandName: string,
): SelectOption[] {
  const brand = options.brands.find((item) => sameText(item.name, brandName));
  if (!brand) return [];
  return options.models
    .filter((model) => model.brandId === brand.id)
    .map((model) => ({ value: model.id, label: model.name }));
}

export function brandOptions(options: VehicleFormOptions): SelectOption[] {
  return options.brands.map((brand) => ({
    value: brand.id,
    label: brand.name,
  }));
}

/** Known years, newest first; the field also accepts a typed one. */
export function yearOptions(options: VehicleFormOptions): SelectOption[] {
  return [...options.years]
    .sort((a, b) => b - a)
    .map((year) => ({ value: String(year), label: String(year) }));
}

/** Every catalog model as "Brand Model", A→Z (the lead's desired vehicle). */
export function catalogModelOptions(options: VehicleFormOptions): SelectOption[] {
  const brandName = new Map(options.brands.map((brand) => [brand.id, brand.name]));
  return options.models
    .map((model) => ({
      value: model.id,
      label: `${brandName.get(model.brandId) ?? ""} ${model.name}`.trim(),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}
