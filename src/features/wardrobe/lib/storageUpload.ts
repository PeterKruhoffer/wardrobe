import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { File, UploadType } from "expo-file-system";
import { Platform } from "react-native";

import type { Id } from "@/convex/_generated/dataModel";
import type {
  WardrobeDirectUploadFailure,
  WardrobeUploadedFile,
  WardrobeUploadAsset,
} from "@/features/wardrobe/types";
import { getErrorMessage } from "@/features/wardrobe/lib/errors";

const normalizedImageQuality = 0.92;
const supportedStorageContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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
  const uploadAsset = await normalizeAssetForStorage(asset);
  const uploadUrl = await generateUploadUrl();
  const contentType = getContentType(uploadAsset);
  const uploadResponse = await uploadAssetFile({
    asset: uploadAsset,
    contentType,
    uploadUrl,
  });

  if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
    throw new Error(
      `Convex storage rejected the upload (${uploadResponse.status}).`,
    );
  }

  let body: unknown;

  try {
    body = JSON.parse(uploadResponse.body) as unknown;
  } catch {
    body = null;
  }

  if (!isStorageUploadResponse(body)) {
    throw new Error("Convex storage did not return a storage id.");
  }

  return {
    storageId: body.storageId,
    ...(uploadAsset.fileName ? { fileName: uploadAsset.fileName } : {}),
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

async function normalizeAssetForStorage(
  asset: WardrobeUploadAsset,
): Promise<WardrobeUploadAsset> {
  if (supportedStorageContentTypes.has(getContentType(asset))) {
    return asset;
  }

  const context = ImageManipulator.manipulate(asset.uri);
  const image = await context.renderAsync();
  const normalizedImage = await image.saveAsync({
    compress: normalizedImageQuality,
    format: SaveFormat.JPEG,
  });
  const { fileSize: _fileSize, ...assetWithoutFileSize } = asset;

  return {
    ...assetWithoutFileSize,
    fileName: getJpegFileName(asset.fileName),
    height: normalizedImage.height,
    mimeType: "image/jpeg",
    uri: normalizedImage.uri,
    width: normalizedImage.width,
  };
}

type UploadAssetFileArgs = {
  asset: WardrobeUploadAsset;
  contentType: string;
  uploadUrl: string;
};

type UploadAssetFileResult = {
  body: string;
  status: number;
};

async function uploadAssetFile({
  asset,
  contentType,
  uploadUrl,
}: UploadAssetFileArgs): Promise<UploadAssetFileResult> {
  if (Platform.OS !== "web") {
    const file = new File(asset.uri);
    const response = await file.upload(uploadUrl, {
      headers: { "Content-Type": contentType },
      httpMethod: "POST",
      mimeType: contentType,
      uploadType: UploadType.BINARY_CONTENT,
    });

    return {
      body: response.body,
      status: response.status,
    };
  }

  const assetResponse = await fetch(asset.uri);
  const blob = await assetResponse.blob();
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  return {
    body: await response.text(),
    status: response.status,
  };
}

function getContentType(asset: WardrobeUploadAsset) {
  return (
    asset.mimeType ||
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

function getJpegFileName(fileName: string | undefined) {
  if (fileName === undefined) {
    return undefined;
  }

  const extensionStart = fileName.lastIndexOf(".");

  if (extensionStart <= 0) {
    return `${fileName}.jpg`;
  }

  return `${fileName.slice(0, extensionStart)}.jpg`;
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
