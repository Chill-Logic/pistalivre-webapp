/** What the fleet has of one model + year (units, available, colours). */
export type CatalogFleet = {
  modelId: string;
  brandName: string;
  modelName: string;
  year: number;
  vehicleType: string | null;
  units: number;
  available: number;
  colors: { color: string; units: number }[];
};

/** A model + year as a product of the catalogue, with its picture. */
export type CatalogItem = {
  id: string;
  modelId: string;
  brandName: string;
  modelName: string;
  year: number;
  description: string | null;
  /** Where to show the picture from (the upload or the link). */
  imageSrc: string | null;
  imageSource: "upload" | "link" | null;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
  fleet: CatalogFleet | null;
  createdAt: string;
  updatedAt: string;
};

export type CatalogOverview = {
  items: CatalogItem[];
  /** Model + year in the fleet with no catalogue item yet. */
  missing: CatalogFleet[];
};

export type CatalogItemInput = {
  /** An existing model, or brand + model by name (created when new). */
  modelId: string | null;
  brand: string;
  model: string;
  year: number;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
};
