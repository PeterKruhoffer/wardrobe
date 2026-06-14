import type { Id } from "@/convex/_generated/dataModel";

export const wardrobeCategoryValues = [
  "tops",
  "bottoms",
  "shoes",
  "hats",
] as const;

export type WardrobeCategory = (typeof wardrobeCategoryValues)[number];

export const wardrobeCategoryOptions: {
  value: WardrobeCategory;
  label: string;
}[] = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "shoes", label: "Shoes" },
  { value: "hats", label: "Hats" },
];

export const MAX_PHOTOS_PER_UPLOAD = 20;

export type WardrobeUploadAsset = {
  id: string;
  uri: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  width: number;
  height: number;
};

export type WardrobeUploadedFile = {
  storageId: Id<"_storage">;
  fileName?: string;
};

export type WardrobeUploadStatus =
  | "idle"
  | "picking"
  | "uploading"
  | "saving"
  | "success"
  | "partial"
  | "error";

export type WardrobeUploadProgress = {
  completed: number;
  total: number;
};

export type WardrobeUploadIssue = {
  title: string;
  message: string;
  detail?: string;
  action?: "openSettings" | "uploadRemaining" | "reviewSelection";
};

export type WardrobeUploadResult = {
  category: WardrobeCategory;
  savedCount: number;
  failedCount: number;
};

export type WardrobeDirectUploadFailure = {
  asset: WardrobeUploadAsset;
  message: string;
};

export function getCategoryLabel(category: WardrobeCategory) {
  return (
    wardrobeCategoryOptions.find((option) => option.value === category)?.label ??
    category
  );
}
