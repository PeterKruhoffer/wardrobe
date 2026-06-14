import type { Id } from "@/convex/_generated/dataModel";
import type {
  WardrobeDirectUploadFailure,
  WardrobeUploadedFile,
  WardrobeUploadAsset,
} from "@/features/wardrobe/types";
import { getErrorMessage } from "@/features/wardrobe/lib/errors";

type UploadWardrobeAssetArgs = {
  asset: WardrobeUploadAsset;
  generateUploadUrl: () => Promise<string>;
};

type UploadWardrobeAssetsArgs = {
  assets: WardrobeUploadAsset[];
  onProgress: (completed: number) => void;
  uploadAsset: (asset: WardrobeUploadAsset) => Promise<WardrobeUploadedFile>;
};

export async function uploadWardrobeAsset({
  asset,
  generateUploadUrl,
}: UploadWardrobeAssetArgs): Promise<WardrobeUploadedFile> {
  const uploadUrl = await generateUploadUrl();
  const assetResponse = await fetch(asset.uri);
  const blob = await assetResponse.blob();
  const contentType = getContentType(asset, blob);

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `Convex storage rejected the upload (${uploadResponse.status}).`,
    );
  }

  const body: unknown = await uploadResponse.json();

  if (!isStorageUploadResponse(body)) {
    throw new Error("Convex storage did not return a storage id.");
  }

  return {
    storageId: body.storageId,
    ...(asset.fileName ? { fileName: asset.fileName } : {}),
  };
}

export async function uploadWardrobeAssets({
  assets,
  onProgress,
  uploadAsset,
}: UploadWardrobeAssetsArgs) {
  const uploadedFiles: WardrobeUploadedFile[] = [];
  const failures: WardrobeDirectUploadFailure[] = [];

  for (const [index, asset] of assets.entries()) {
    try {
      uploadedFiles.push(await uploadAsset(asset));
    } catch (error) {
      failures.push({
        asset,
        message: getErrorMessage(error),
      });
    } finally {
      onProgress(index + 1);
    }
  }

  return { failures, uploadedFiles };
}

function getContentType(asset: WardrobeUploadAsset, blob: Blob) {
  return (
    asset.mimeType ||
    blob.type ||
    getMimeTypeFromFileName(asset.fileName) ||
    "image/jpeg"
  );
}

function getMimeTypeFromFileName(fileName: string | undefined) {
  const extension = fileName?.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "avif":
      return "image/avif";
    case "gif":
      return "image/gif";
    case "heic":
    case "heif":
      return "image/heic";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return undefined;
  }
}

function isStorageUploadResponse(
  value: unknown,
): value is { storageId: Id<"_storage"> } {
  return (
    typeof value === "object" &&
    value !== null &&
    "storageId" in value &&
    typeof value.storageId === "string"
  );
}
